const OpenAI = require('openai');

const MODELO_PADRAO = process.env.OPENAI_MODEL || 'gpt-5.1';
const MAX_TOOL_ROUNDS = 4;

const DEFINICOES_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'consultar_saldo',
            description: 'Consulta o saldo de moedas do usuário. Use quando a pessoa perguntar quanto dinheiro/moedas possui.',
            parameters: {
                type: 'object',
                properties: {
                    alvo: {
                        type: 'string',
                        enum: ['eu', 'mencionado', 'respondido'],
                        description: 'Quem consultar. Use eu por padrão; mencionado ou respondido somente quando o contexto da mensagem indicar esse alvo.'
                    }
                },
                required: ['alvo'],
                additionalProperties: false
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'consultar_xp',
            description: 'Consulta XP, nível e quantidade de mensagens do usuário no grupo atual.',
            parameters: {
                type: 'object',
                properties: {
                    alvo: {
                        type: 'string',
                        enum: ['eu', 'mencionado', 'respondido'],
                        description: 'Quem consultar. Use eu por padrão; mencionado ou respondido somente quando o contexto da mensagem indicar esse alvo.'
                    }
                },
                required: ['alvo'],
                additionalProperties: false
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'consultar_perfil',
            description: 'Consulta o perfil de XP do usuário no grupo atual, incluindo nível, XP, mensagens e progresso para o próximo nível.',
            parameters: {
                type: 'object',
                properties: {
                    alvo: {
                        type: 'string',
                        enum: ['eu', 'mencionado', 'respondido'],
                        description: 'Quem consultar. Use eu por padrão; mencionado ou respondido somente quando o contexto da mensagem indicar esse alvo.'
                    }
                },
                required: ['alvo'],
                additionalProperties: false
            }
        }
    }
];

function criarAgenteIA(dependencias) {
    const {
        resolverIdEconomia,
        garantirCarteira,
        garantirDadosXP,
        calcularNivel
    } = dependencias;

    let cliente = null;

    function obterCliente() {
        if (!process.env.OPENAI_API_KEY) return null;
        if (!cliente) {
            cliente = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return cliente;
    }

    function obterIdAlvo(contexto, alvo) {
        const chave = ['eu', 'mencionado', 'respondido'].includes(alvo) ? alvo : 'eu';
        return contexto?.alvos?.[chave] || null;
    }

    async function executarTool(nome, argumentos, contexto) {
        const alvo = obterIdAlvo(contexto, argumentos?.alvo);
        if (!alvo) {
            return { sucesso: false, erro: 'Esse alvo não está disponível no contexto da mensagem.' };
        }

        if (nome === 'consultar_saldo') {
            const usuarioId = await resolverIdEconomia(alvo);
            if (!usuarioId) return { sucesso: false, erro: 'Não foi possível identificar o usuário.' };
            const carteira = garantirCarteira(usuarioId);
            if (!carteira) return { sucesso: false, erro: 'Não foi possível acessar a carteira.' };
            return {
                sucesso: true,
                saldo: Number(carteira.saldo) || 0,
                mineracoes: Number(carteira.mineracoes) || 0,
                roubos_sucesso: Number(carteira.roubosSucesso) || 0
            };
        }

        const dados = garantirDadosXP(contexto.grupoId, alvo);
        const nivel = calcularNivel(dados.xp);
        const nivelAtual = nivel;
        const proximoNivel = nivelAtual + 1;
        const xpProximoNivel = Math.pow(proximoNivel - 1, 2) * 100;
        const xpNivelAtual = Math.pow(nivelAtual - 1, 2) * 100;
        const xpNecessario = xpProximoNivel - xpNivelAtual;
        const xpNoNivel = dados.xp - xpNivelAtual;
        const progresso = Math.min(1, Math.max(0, xpNoNivel / xpNecessario));
        const xpRestante = Math.max(0, xpProximoNivel - dados.xp);

        const resposta = {
            sucesso: true,
            xp: Number(dados.xp) || 0,
            nivel: Number(nivel) || 1,
            mensagens: Number(dados.mensagens) || 0,
            xp_para_proximo_nivel: xpRestante,
            progresso_percentual: Math.round(progresso * 100)
        };

        if (nome === 'consultar_perfil') {
            resposta.perfil = true;
        }

        return resposta;
    }

    async function responder(pergunta, contexto) {
        const client = obterCliente();
        if (!client) {
            return {
                sucesso: false,
                configuracao: true,
                mensagem: 'A IA ainda não está configurada. Defina a variável de ambiente OPENAI_API_KEY no computador onde o bot roda.'
            };
        }

        const system = [
            'Você é a IA do JUST BOT, um bot de WhatsApp em português do Brasil.',
            'Responda de forma natural, amigável e objetiva.',
            'Você pode consultar somente saldo, XP e perfil usando as ferramentas disponíveis.',
            'Nunca invente dados. Quando precisar de um dado do bot, use a ferramenta correspondente.',
            'Não exponha IDs internos, números de telefone ou detalhes técnicos das ferramentas.',
            'Não execute ações que não estejam disponíveis nas ferramentas.',
            'Se a pergunta não puder ser respondida com as ferramentas disponíveis, responda normalmente sem fingir que consultou o bot.',
            'Quando o usuário mencionar alguém ou responder a uma mensagem, use o alvo correspondente apenas se isso fizer sentido para a pergunta.',
            'Não diga que consultou uma ferramenta. Apenas apresente o resultado de forma natural.'
        ].join(' ');

        const contextoTexto = JSON.stringify({
            grupo: contexto.grupoId,
            alvos_disponiveis: {
                eu: Boolean(contexto?.alvos?.eu),
                mencionado: Boolean(contexto?.alvos?.mencionado),
                respondido: Boolean(contexto?.alvos?.respondido)
            }
        });

        const messages = [
            { role: 'system', content: system },
            { role: 'system', content: `Contexto seguro da mensagem: ${contextoTexto}` },
            { role: 'user', content: String(pergunta || '').trim() }
        ];

        for (let rodada = 0; rodada < MAX_TOOL_ROUNDS; rodada++) {
            const completion = await client.chat.completions.create({
                model: MODELO_PADRAO,
                messages,
                tools: DEFINICOES_TOOLS,
                tool_choice: 'auto',
                max_completion_tokens: 500
            });

            const mensagem = completion.choices?.[0]?.message;
            if (!mensagem) {
                throw new Error('A OpenAI não retornou uma resposta válida.');
            }

            if (!mensagem.tool_calls?.length) {
                return {
                    sucesso: true,
                    texto: String(mensagem.content || '').trim() || 'Não consegui formular uma resposta agora.'
                };
            }

            messages.push(mensagem);

            for (const chamada of mensagem.tool_calls) {
                if (chamada.type !== 'function') continue;

                let argumentos = {};
                try {
                    argumentos = JSON.parse(chamada.function.arguments || '{}');
                } catch {
                    argumentos = {};
                }

                let resultado;
                try {
                    resultado = await executarTool(chamada.function.name, argumentos, contexto);
                } catch (erro) {
                    console.error(`❌ Erro na ferramenta de IA ${chamada.function.name}:`, erro);
                    resultado = { sucesso: false, erro: 'Não foi possível consultar esse dado agora.' };
                }

                messages.push({
                    role: 'tool',
                    tool_call_id: chamada.id,
                    content: JSON.stringify(resultado)
                });
            }
        }

        throw new Error('A IA excedeu o limite de consultas internas.');
    }

    return { responder };
}

module.exports = { criarAgenteIA };
