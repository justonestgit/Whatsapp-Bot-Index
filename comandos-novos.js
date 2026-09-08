const crypto = require('crypto');

function criarComandosNovos(deps) {
    const {
        client,
        Poll,
        responderCitando,
        reagir,
        enviarComMencoes,
        obterPrefixoGrupo,
        obterConfigAdmin,
        salvarConfigAdmin,
        exigirAdmin,
        obterIdRemetente,
        buscarJsonAPI,
        garantirDadosXP,
        calcularNivel,
        salvarXP,
        resolverIdEconomia,
        garantirCarteira,
        registrarTransacao,
        salvarMoedas,
        sorteiosGrupos
    } = deps;

    const quizzesRapidos = new Map();
    const historicosComandos = new Map();
    let lembretesIniciados = false;

    function caixa(emoji, titulo, linhas) {
        return [
            '┏═•❃༺' + emoji + '༻❃•═┓',
            '│       *' + titulo + '*',
            '├✯',
            '│',
            ...linhas,
            '│',
            '┗═•❃༺' + emoji + '༻❃•═┛'
        ].join('\n');
    }

    function normalizar(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function ehGrupo(message) {
        return Boolean(message?.from?.endsWith('@g.us'));
    }

    function obterPrefixo(message) {
        return obterPrefixoGrupo(message.from);
    }

    function limitar(texto, tamanho) {
        const valor = String(texto || '').trim();
        return valor.length <= tamanho ? valor : valor.slice(0, Math.max(0, tamanho - 3)).trim() + '...';
    }

    function formatarDuracao(ms) {
        const segundos = Math.max(1, Math.ceil(ms / 1000));
        if (segundos < 60) return segundos + ' segundo(s)';
        const minutos = Math.ceil(segundos / 60);
        if (minutos < 60) return minutos + ' minuto(s)';
        const horas = Math.ceil(minutos / 60);
        if (horas < 24) return horas + ' hora(s)';
        return Math.ceil(horas / 24) + ' dia(s)';
    }

    function parseDuracaoLembrete(texto) {
        const resultado = String(texto || '').trim().match(/^(\d+)(s|m|h|d)$/i);
        if (!resultado) return null;
        const quantidade = Number(resultado[1]);
        const unidade = resultado[2].toLowerCase();
        const fator = unidade === 'd' ? 86400000 : unidade === 'h' ? 3600000 : unidade === 'm' ? 60000 : 1000;
        const ms = quantidade * fator;
        if (!Number.isFinite(ms) || ms < 60000 || ms > 7 * 86400000) return null;
        return ms;
    }

    function registrarHistorico(message, comando, argumentos) {
        if (!ehGrupo(message)) return;
        if (!historicosComandos.has(message.from)) historicosComandos.set(message.from, []);
        const historico = historicosComandos.get(message.from);
        const autor = obterIdRemetente(message) || message.author || message.from;
        historico.unshift({
            data: Date.now(),
            autor: String(autor),
            comando: String(comando || '').toLowerCase(),
            argumentos: limitar(argumentos, 45)
        });
        if (historico.length > 40) historico.length = 40;
    }

    async function comandoEnquete(message, argumentos) {
        const partes = String(argumentos || '').split('|').map(item => item.trim()).filter(Boolean);
        const prefixo = obterPrefixo(message);

        if (partes.length < 3) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('📊', '𝐄𝐍𝐐𝐔𝐄𝐓𝐄', [
                '├➤ _Informe uma pergunta e pelo menos duas opções._',
                '├➤ *Exemplo:*',
                '├➤ *' + prefixo + 'enquete Filme? | Ação | Comédia*'
            ]));
            return;
        }

        const pergunta = limitar(partes.shift(), 220);
        const opcoes = partes.slice(0, 12).map(opcao => limitar(opcao, 100));

        if (opcoes.length < 2) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Uma enquete precisa de pelo menos duas opções._');
            return;
        }

        try {
            const enquete = new Poll(pergunta, opcoes, { allowMultipleAnswers: false });
            await reagir(message, '📊');
            await responderCitando(message, caixa('📊', '𝐄𝐍𝐐𝐔𝐄𝐓𝐄 𝐀𝐁𝐄𝐑𝐓𝐀', [
                '├➤ 🗳️ _Vote na enquete enviada logo abaixo!_',
                '├➤ 🔒 _Uma resposta por pessoa._'
            ]));
            await client.sendMessage(message.from, enquete);
        } catch (erro) {
            console.error('❌ Erro ao criar enquete:', erro.message);
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui criar essa enquete agora._');
        }
    }

    async function verificarLembretes() {
        const agora = Date.now();

        for (const [grupoId, config] of deps.configuracoesAdminGrupos.entries()) {
            const lista = Array.isArray(config.lembretes) ? config.lembretes : [];
            const pendentes = lista.filter(item => Number(item?.quando) > agora);
            const vencidos = lista.filter(item => Number(item?.quando) <= agora);

            if (vencidos.length === 0) continue;

            config.lembretes = pendentes;
            salvarConfigAdmin();

            for (const lembrete of vencidos) {
                try {
                    const texto = caixa('⏰', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄', [
                        '├➤ ⏳ _O tempo acabou!_',
                        '├➤ 💬 *' + limitar(lembrete.texto, 600) + '*'
                    ]);
                    const opcoes = lembrete.autor ? { mentions: [lembrete.autor] } : {};
                    await enviarComMencoes(grupoId, texto, opcoes);
                } catch (erro) {
                    console.error('❌ Erro ao enviar lembrete:', erro.message);
                }
            }
        }
    }

    async function iniciarLembretes() {
        if (lembretesIniciados) return;
        lembretesIniciados = true;
        await verificarLembretes();
        setInterval(() => {
            verificarLembretes().catch(erro => console.error('❌ Erro ao verificar lembretes:', erro.message));
        }, 15000);
    }

    async function comandoLembrete(message, argumentos) {
        if (!ehGrupo(message)) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('⏰', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄', [
                '├➤ _Esse comando funciona apenas em grupos._'
            ]));
            return;
        }

        const [duracaoTexto, ...restante] = String(argumentos || '').trim().split(/\s+/);
        const texto = restante.join(' ').trim();
        const duracao = parseDuracaoLembrete(duracaoTexto);
        const prefixo = obterPrefixo(message);

        if (!duracao || !texto) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('⏰', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄', [
                '├➤ _Use uma duração entre 1 minuto e 7 dias._',
                '├➤ *Exemplo:*',
                '├➤ *' + prefixo + 'lembrete 30m Reunião em meia hora*'
            ]));
            return;
        }

        const config = obterConfigAdmin(message.from);
        if (!Array.isArray(config.lembretes)) config.lembretes = [];
        if (config.lembretes.length >= 25) {
            await reagir(message, '⚠️');
            await responderCitando(message, '⚠️ _Este grupo já tem 25 lembretes pendentes._');
            return;
        }

        const lembrete = {
            id: crypto.randomBytes(3).toString('hex').toUpperCase(),
            texto: limitar(texto, 600),
            quando: Date.now() + duracao,
            autor: obterIdRemetente(message) || null
        };

        config.lembretes.push(lembrete);
        salvarConfigAdmin();

        await reagir(message, '⏰');
        await responderCitando(message, caixa('⏰', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄 𝐀𝐆𝐄𝐍𝐃𝐀𝐃𝐎', [
            '├➤ 💬 *' + lembrete.texto + '*',
            '├➤ 🕐 Daqui a *' + formatarDuracao(duracao) + '*',
            '├➤ 🆔 Código: *' + lembrete.id + '*',
            '├➤ _Cancelar: ' + prefixo + 'cancelarlembrete ' + lembrete.id + '_'
        ]));
    }

    async function comandoCancelarLembrete(message, argumentos) {
        if (!ehGrupo(message)) {
            await responderCitando(message, '❌ _Esse comando funciona apenas em grupos._');
            return;
        }

        const id = String(argumentos || '').trim().toUpperCase();
        const prefixo = obterPrefixo(message);
        const config = obterConfigAdmin(message.from);
        const lista = Array.isArray(config.lembretes) ? config.lembretes : [];
        const indice = lista.findIndex(item => item?.id === id);

        if (!id || indice === -1) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('🗑️', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄', [
                '├➤ _Não encontrei esse código neste grupo._',
                '├➤ *Uso:* ' + prefixo + 'cancelarlembrete CODIGO'
            ]));
            return;
        }

        const lembrete = lista[indice];
        const autor = obterIdRemetente(message);
        const admin = await deps.usuarioEhAdminDoGrupo(message);
        if (!admin && autor !== lembrete.autor) {
            await reagir(message, '🔒');
            await responderCitando(message, '🔒 _Só quem criou o lembrete ou um administrador pode cancelá-lo._');
            return;
        }

        lista.splice(indice, 1);
        config.lembretes = lista;
        salvarConfigAdmin();

        await reagir(message, '🗑️');
        await responderCitando(message, caixa('🗑️', '𝐋𝐄𝐌𝐁𝐑𝐄𝐓𝐄 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎', [
            '├➤ 💬 *' + lembrete.texto + '*',
            '├➤ ✅ _O agendamento foi removido._'
        ]));
    }

    async function comandoHistoricoComandos(message) {
        if (!ehGrupo(message) || !(await exigirAdmin(message))) return;
        const historico = historicosComandos.get(message.from) || [];
        const mencoes = historico.slice(0, 20).map(item => item.autor);
        const linhas = historico.slice(0, 20).map((item, indice) => {
            const horario = new Date(item.data).toLocaleTimeString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit'
            });
            const detalhes = item.argumentos ? ' _' + item.argumentos + '_' : '';
            return '├➤ ' + (indice + 1) + '. *' + horario + '* · @' + item.autor.split('@')[0] + '\n│   ;' + item.comando + detalhes;
        });

        await reagir(message, '📜');
        await enviarComMencoes(message.from, caixa('📜', '𝐇𝐈𝐒𝐓Ó𝐑𝐈𝐂𝐎 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒', [
            ...(linhas.length ? linhas : ['├➤ _Nenhum comando foi registrado nesta sessão._']),
            '├✯',
            '├➤ _Exibe até 20 comandos da sessão atual._'
        ]), { mentions: mencoes });
    }

    async function comandoCotarCrypto(message, argumentos) {
        const partes = String(argumentos || '').trim().toUpperCase().split(/\s+/).filter(Boolean);
        const simbolo = partes[0] || 'BTC';
        const destino = (partes[1] || 'BRL').toLowerCase();
        const prefixo = obterPrefixo(message);

        if (!/^[A-Z0-9]{2,12}$/.test(simbolo) || !/^[a-z]{3,8}$/.test(destino)) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Use:_ *' + prefixo + 'cotarcrypto BTC BRL*');
            return;
        }

        const conhecidas = {
            BTC: 'bitcoin',
            ETH: 'ethereum',
            SOL: 'solana',
            BNB: 'binancecoin',
            XRP: 'ripple',
            ADA: 'cardano',
            DOGE: 'dogecoin',
            USDT: 'tether',
            USDC: 'usd-coin'
        };

        try {
            let id = conhecidas[simbolo];
            let nome = simbolo;

            if (!id) {
                const busca = await buscarJsonAPI('https://api.coingecko.com/api/v3/search?query=' + encodeURIComponent(simbolo));
                const moeda = (busca?.coins || []).find(item => String(item.symbol || '').toUpperCase() === simbolo) || busca?.coins?.[0];
                if (!moeda?.id) throw new Error('Cripto não encontrada');
                id = moeda.id;
                nome = moeda.name || simbolo;
            }

            const dados = await buscarJsonAPI(
                'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(id) +
                '&vs_currencies=' + encodeURIComponent(destino) +
                '&include_24hr_change=true'
            );
            const cotacao = dados?.[id];
            const preco = Number(cotacao?.[destino]);
            const variacao = Number(cotacao?.[destino + '_24h_change']);

            if (!Number.isFinite(preco)) throw new Error('Cotação indisponível');

            const moedaDestino = destino.toUpperCase();
            const formato = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: moedaDestino,
                maximumFractionDigits: preco < 1 ? 8 : 2
            });

            const variacaoTexto = Number.isFinite(variacao)
                ? (variacao >= 0 ? '📈 +' : '📉 ') + variacao.toFixed(2) + '%'
                : '➖ Indisponível';

            await reagir(message, '🪙');
            await responderCitando(message, caixa('🪙', '𝐂𝐑𝐈𝐏𝐓𝐎 𝐂𝐎𝐓𝐀ÇÃ𝐎', [
                '├➤ 🪙 *' + nome + ' (' + simbolo + ')*',
                '├➤ 💰 *' + formato.format(preco) + '*',
                '├➤ 📊 24h: *' + variacaoTexto + '*',
                '├➤ 🌐 Mercado: *' + moedaDestino + '*'
            ]));
        } catch (erro) {
            console.error('❌ Erro na cotação de cripto:', erro.message);
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui consultar essa criptomoeda agora._');
        }
    }

    async function comandoTempoHistorico(message, argumentos) {
        const cidade = String(argumentos || '').trim();
        const prefixo = obterPrefixo(message);

        if (!cidade) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Use:_ *' + prefixo + 'tempohistorico São Paulo*');
            return;
        }

        try {
            const geocoding = await buscarJsonAPI(
                'https://geocoding-api.open-meteo.com/v1/search?name=' +
                encodeURIComponent(cidade) + '&count=1&language=pt&format=json'
            );
            const local = geocoding?.results?.[0];
            if (!local) throw new Error('Cidade não encontrada');

            const fim = new Date();
            fim.setUTCDate(fim.getUTCDate() - 5);
            const inicio = new Date(fim);
            inicio.setUTCDate(inicio.getUTCDate() - 6);

            const dataInicio = inicio.toISOString().slice(0, 10);
            const dataFim = fim.toISOString().slice(0, 10);
            const dados = await buscarJsonAPI(
                'https://archive-api.open-meteo.com/v1/archive?latitude=' + local.latitude +
                '&longitude=' + local.longitude +
                '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
                '&timezone=auto&start_date=' + dataInicio + '&end_date=' + dataFim
            );
            const diario = dados?.daily || {};
            const datas = diario.time || [];
            if (!datas.length) throw new Error('Histórico indisponível');

            const linhas = datas.map((data, indice) => {
                const min = diario.temperature_2m_min?.[indice];
                const max = diario.temperature_2m_max?.[indice];
                const chuva = diario.precipitation_sum?.[indice];
                return '├➤ 📅 *' + data.split('-').reverse().join('/') + '* · ' + min + '° a ' + max + '° · ☔ ' + chuva + ' mm';
            });

            await reagir(message, '📆');
            await responderCitando(message, caixa('📆', '𝐓𝐄𝐌𝐏𝐎 𝐇𝐈𝐒𝐓Ó𝐑𝐈𝐂𝐎', [
                '├➤ 📍 *' + (local.name || cidade) + '*',
                '├➤ 🌎 ' + [local.admin1, local.country].filter(Boolean).join(', '),
                '├✯',
                ...linhas,
                '├✯',
                '├➤ _Período fechado de 7 dias._'
            ]));
        } catch (erro) {
            console.error('❌ Erro no histórico de clima:', erro.message);
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui consultar o histórico dessa cidade agora._');
        }
    }

    function limparPergunta(texto) {
        return decodeURIComponent(String(texto || ''))
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function embaralhar(lista) {
        const copia = [...lista];
        for (let i = copia.length - 1; i > 0; i -= 1) {
            const j = crypto.randomInt(i + 1);
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }

    async function enviarPerguntaQuizRapido(message, estado) {
        const pergunta = estado.perguntas[estado.indice];
        const letras = ['a', 'b', 'c', 'd'];
        const opcoes = pergunta.opcoes.map((opcao, indice) => '├➤ ' + letras[indice].toUpperCase() + ') ' + opcao);

        await responderCitando(message, caixa('🧠', '𝐐𝐔𝐈𝐙 𝐑Á𝐏𝐈𝐃𝐎', [
            '├➤ 📚 Tema: *' + estado.tema + '*',
            '├➤ 🎯 Pergunta *' + (estado.indice + 1) + '/5*',
            '│',
            '├➤ _' + pergunta.pergunta + '_',
            '│',
            ...opcoes,
            '├✯',
            '├➤ *Responda: ' + obterPrefixo(message) + 'quizrapido A/B/C/D*'
        ]));
    }

    async function comandoQuizRapido(message, argumentos) {
        const resposta = normalizar(argumentos);
        const ativo = quizzesRapidos.get(message.from);

        if (ativo && /^[abcd]$/.test(resposta)) {
            const pergunta = ativo.perguntas[ativo.indice];
            const acertou = resposta === pergunta.resposta;
            if (acertou) ativo.acertos += 1;
            ativo.indice += 1;

            await reagir(message, acertou ? '✅' : '❌');
            if (ativo.indice >= ativo.perguntas.length) {
                clearTimeout(ativo.timer);
                quizzesRapidos.delete(message.from);
                await responderCitando(message, caixa(acertou ? '🏆' : '🎯', '𝐐𝐔𝐈𝐙 𝐑Á𝐏𝐈𝐃𝐎 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐎', [
                    '├➤ ' + (acertou ? '✅ _Resposta correta!_' : '❌ _Resposta incorreta._'),
                    '├➤ 🏆 Acertos: *' + ativo.acertos + '/5*',
                    '├➤ _Use ' + obterPrefixo(message) + 'quizrapido <tema> para jogar de novo._'
                ]));
                return;
            }

            await responderCitando(message, caixa(acertou ? '✅' : '❌', acertou ? '𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 𝐂𝐎𝐑𝐑𝐄𝐓𝐀' : '𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 𝐈𝐍𝐂𝐎𝐑𝐑𝐄𝐓𝐀', [
                '├➤ 🏆 Placar: *' + ativo.acertos + '/' + ativo.indice + '*',
                '├➤ _Próxima pergunta a seguir._'
            ]));
            await enviarPerguntaQuizRapido(message, ativo);
            return;
        }

        if (ativo) {
            await reagir(message, '🧠');
            await responderCitando(message, '🧠 _Há um quiz em andamento. Responda com_ *' + obterPrefixo(message) + 'quizrapido A, B, C ou D*' + '.');
            return;
        }

        const temas = {
            geral: { nome: 'Conhecimentos Gerais', categoria: 9 },
            filmes: { nome: 'Filmes', categoria: 11 },
            musica: { nome: 'Música', categoria: 12 },
            esportes: { nome: 'Esportes', categoria: 21 },
            historia: { nome: 'História', categoria: 23 },
            geografia: { nome: 'Geografia', categoria: 22 },
            ciencia: { nome: 'Ciência', categoria: 17 }
        };
        const chave = resposta || 'geral';
        const tema = temas[chave];

        if (!tema) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('🧠', '𝐐𝐔𝐈𝐙 𝐑Á𝐏𝐈𝐃𝐎', [
                '├➤ _Tema não encontrado._',
                '├➤ *Temas:* geral, filmes, música, esportes, história, geografia, ciência',
                '├➤ *Exemplo:* ' + obterPrefixo(message) + 'quizrapido filmes'
            ]));
            return;
        }

        try {
            const dados = await buscarJsonAPI(
                'https://opentdb.com/api.php?amount=5&category=' + tema.categoria +
                '&type=multiple&encode=url3986'
            );
            if (!dados?.results || dados.results.length < 5 || dados.response_code !== 0) {
                throw new Error('Perguntas indisponíveis');
            }

            const perguntas = dados.results.map(item => {
                const correta = limparPergunta(item.correct_answer);
                const opcoes = embaralhar([correta, ...(item.incorrect_answers || []).map(limparPergunta)]);
                return {
                    pergunta: limparPergunta(item.question),
                    opcoes,
                    resposta: ['a', 'b', 'c', 'd'][opcoes.indexOf(correta)]
                };
            });

            const estado = {
                id: crypto.randomBytes(6).toString('hex'),
                tema: tema.nome,
                perguntas,
                indice: 0,
                acertos: 0
            };
            estado.timer = setTimeout(() => {
                const atual = quizzesRapidos.get(message.from);
                if (atual?.id === estado.id) quizzesRapidos.delete(message.from);
            }, 20 * 60000);

            quizzesRapidos.set(message.from, estado);
            await reagir(message, '🧠');
            await enviarPerguntaQuizRapido(message, estado);
        } catch (erro) {
            console.error('❌ Erro no quiz rápido:', erro.message);
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui montar o quiz agora. Tente novamente em alguns segundos._');
        }
    }

    function desafioAtual() {
        const chave = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
        const desafios = [
            { titulo: '𝐂𝐎𝐍𝐓𝐀 𝐑𝐄𝐋Â𝐌𝐏𝐀𝐆𝐎', pergunta: 'Quanto é 9 × 7?', resposta: '63' },
            { titulo: '𝐂𝐎𝐍𝐓𝐀 𝐑𝐄𝐋Â𝐌𝐏𝐀𝐆𝐎', pergunta: 'Quanto é 144 ÷ 12?', resposta: '12' },
            { titulo: '𝐋Ó𝐆𝐈𝐂𝐀', pergunta: 'Complete: 2, 4, 8, 16, ...', resposta: '32' },
            { titulo: '𝐂𝐔𝐋𝐓𝐔𝐑𝐀 𝐆𝐄𝐑𝐀𝐋', pergunta: 'Qual é a capital do Brasil?', resposta: 'brasilia' },
            { titulo: '𝐂𝐎𝐍𝐓𝐀 𝐑𝐄𝐋Â𝐌𝐏𝐀𝐆𝐎', pergunta: 'Quanto é 15% de 200?', resposta: '30' },
            { titulo: '𝐋Ó𝐆𝐈𝐂𝐀', pergunta: 'Se hoje é terça, que dia será daqui a 3 dias?', resposta: 'sexta' },
            { titulo: '𝐂𝐔𝐋𝐓𝐔𝐑𝐀 𝐆𝐄𝐑𝐀𝐋', pergunta: 'Qual planeta é conhecido como planeta vermelho?', resposta: 'marte' }
        ];
        const numeros = chave.replace(/\D/g, '');
        const indice = numeros.split('').reduce((total, numero) => total + Number(numero), 0) % desafios.length;
        return { chave, ...desafios[indice] };
    }

    async function comandoDesafioDiario(message, argumentos) {
        if (!ehGrupo(message)) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _O desafio diário funciona apenas em grupos._');
            return;
        }

        const desafio = desafioAtual();
        const config = obterConfigAdmin(message.from);
        if (!config.desafioDiario || config.desafioDiario.data !== desafio.chave) {
            config.desafioDiario = { data: desafio.chave, concluidos: {} };
            salvarConfigAdmin();
        }

        const autor = obterIdRemetente(message);
        const resposta = normalizar(argumentos);

        if (!resposta) {
            await reagir(message, '🎯');
            await responderCitando(message, caixa('🎯', '𝐃𝐄𝐒𝐀𝐅𝐈𝐎 𝐃𝐈Á𝐑𝐈𝐎', [
                '├➤ 🧩 *' + desafio.titulo + '*',
                '├➤ _' + desafio.pergunta + '_',
                '├✯',
                '├➤ 🎁 Recompensa: *30 XP + 75 moedas*',
                '├➤ *Responder:* ' + obterPrefixo(message) + 'desafiodiario sua resposta'
            ]));
            return;
        }

        if (!autor) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui identificar quem respondeu._');
            return;
        }

        if (config.desafioDiario.concluidos?.[autor]) {
            await reagir(message, '📌');
            await responderCitando(message, '📌 _Você já concluiu o desafio de hoje neste grupo._');
            return;
        }

        if (resposta !== normalizar(desafio.resposta)) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('❌', '𝐓𝐄𝐍𝐓𝐀𝐓𝐈𝐕𝐀 𝐈𝐍𝐂𝐎𝐑𝐑𝐄𝐓𝐀', [
                '├➤ _Tente outra vez. Você ainda pode ganhar a recompensa!_'
            ]));
            return;
        }

        const dadosXP = garantirDadosXP(message.from, autor);
        dadosXP.xp += 30;
        dadosXP.nivel = calcularNivel(dadosXP.xp);
        salvarXP();

        const identidade = await resolverIdEconomia(autor);
        if (identidade) {
            const carteira = garantirCarteira(identidade);
            carteira.saldo += 75;
            registrarTransacao('desafio_diario', null, identidade, 75, 'Recompensa do desafio diário');
            salvarMoedas();
        }

        config.desafioDiario.concluidos[autor] = new Date().toISOString();
        salvarConfigAdmin();

        await reagir(message, '🏆');
        await responderCitando(message, caixa('🏆', '𝐃𝐄𝐒𝐀𝐅𝐈𝐎 𝐂𝐎𝐍𝐂𝐋𝐔Í𝐃𝐎', [
            '├➤ ✅ _Resposta correta!_',
            '├➤ ⭐ Você ganhou *30 XP*',
            '├➤ 🪙 Você ganhou *75 moedas*',
            '├➤ _Volte amanhã para um novo desafio._'
        ]));
    }

    function parseDuracaoSorteio(texto) {
        const resultado = String(texto || '').trim().match(/^(\d+)(s|m|h)$/i);
        if (!resultado) return null;
        const valor = Number(resultado[1]);
        const fator = resultado[2].toLowerCase() === 'h' ? 3600000 : resultado[2].toLowerCase() === 'm' ? 60000 : 1000;
        const duracao = valor * fator;
        return Number.isFinite(duracao) && duracao >= 60000 && duracao <= 86400000 ? duracao : null;
    }

    async function comandoSorteioAnonimo(message, argumentos) {
        if (!ehGrupo(message) || !(await exigirAdmin(message))) return;
        if (sorteiosGrupos.has(message.from)) {
            await reagir(message, '⚠️');
            await responderCitando(message, '⚠️ _Já existe um sorteio ativo neste grupo._');
            return;
        }

        const [duracaoTexto, ...restante] = String(argumentos || '').trim().split(/\s+/);
        const duracao = parseDuracaoSorteio(duracaoTexto);
        const premio = limitar(restante.join(' '), 220);
        const prefixo = obterPrefixo(message);

        if (!duracao || !premio) {
            await reagir(message, '❌');
            await responderCitando(message, caixa('🕶️', '𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐀𝐍Ô𝐍𝐈𝐌𝐎', [
                '├➤ *Uso:* ' + prefixo + 'sorteioanonimo 10m prêmio',
                '├➤ _Duração: de 1 minuto a 24 horas._'
            ]));
            return;
        }

        const sorteio = {
            anonimo: true,
            premio,
            participantes: new Set(),
            fim: Date.now() + duracao
        };
        sorteiosGrupos.set(message.from, sorteio);

        sorteio.timer = setTimeout(async () => {
            const atual = sorteiosGrupos.get(message.from);
            if (!atual || atual !== sorteio) return;
            sorteiosGrupos.delete(message.from);

            const participantes = [...atual.participantes];
            if (!participantes.length) {
                await client.sendMessage(message.from, caixa('🕶️', '𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐀𝐍Ô𝐍𝐈𝐌𝐎', [
                    '├➤ _Encerrado sem participantes._'
                ]));
                return;
            }

            const vencedor = participantes[crypto.randomInt(participantes.length)];
            await enviarComMencoes(message.from, caixa('🏆', '𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐀𝐍Ô𝐍𝐈𝐌𝐎', [
                '├➤ 🎁 Prêmio: *' + atual.premio + '*',
                '├➤ 👑 Vencedor: @' + vencedor.split('@')[0],
                '├➤ 🔒 _As participações permaneceram privadas._'
            ]), { mentions: [vencedor] });
        }, duracao);

        await reagir(message, '🕶️');
        await responderCitando(message, caixa('🕶️', '𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐀𝐍Ô𝐍𝐈𝐌𝐎', [
            '├➤ 🎁 Prêmio: *' + premio + '*',
            '├➤ ⏳ Duração: *' + formatarDuracao(duracao) + '*',
            '├➤ 🎟️ Participar: *' + prefixo + 'participaranonimo*',
            '├➤ 🔒 _Nomes não serão divulgados antes do resultado._'
        ]));
    }

    async function comandoParticiparAnonimo(message) {
        const sorteio = sorteiosGrupos.get(message.from);
        if (!sorteio?.anonimo) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não há sorteio anônimo ativo neste grupo._');
            return;
        }

        const autor = obterIdRemetente(message);
        if (!autor) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui registrar sua participação._');
            return;
        }

        if (sorteio.participantes.has(autor)) {
            await reagir(message, '📌');
            await responderCitando(message, '📌 _Sua participação já está confirmada e permanece privada._');
            return;
        }

        sorteio.participantes.add(autor);
        await reagir(message, '🎟️');
        await responderCitando(message, caixa('🎟️', '𝐏𝐀𝐑𝐓𝐈𝐂𝐈𝐏𝐀ÇÃ𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐀', [
            '├➤ 🔒 _Seu nome não será exibido antes do resultado._',
            '├➤ 🍀 _Boa sorte!_'
        ]));
    }

    async function executar(message, comando, argumentos) {
        registrarHistorico(message, comando, argumentos);

        switch (comando) {
            case 'enquete':
                await comandoEnquete(message, argumentos);
                return true;
            case 'lembrete':
                await comandoLembrete(message, argumentos);
                return true;
            case 'cancelarlembrete':
                await comandoCancelarLembrete(message, argumentos);
                return true;
            case 'historicocomandos':
                await comandoHistoricoComandos(message);
                return true;
            case 'cotarcrypto':
                await comandoCotarCrypto(message, argumentos);
                return true;
            case 'tempohistorico':
                await comandoTempoHistorico(message, argumentos);
                return true;
            case 'quizrapido':
                await comandoQuizRapido(message, argumentos);
                return true;
            case 'desafiodiario':
            case 'desafio-diario':
                await comandoDesafioDiario(message, argumentos);
                return true;
            case 'sorteioanonimo':
                await comandoSorteioAnonimo(message, argumentos);
                return true;
            case 'participaranonimo':
                await comandoParticiparAnonimo(message);
                return true;
            default:
                return false;
        }
    }

    client.on('ready', () => {
        iniciarLembretes().catch(erro => console.error('❌ Erro ao iniciar lembretes:', erro.message));
    });

    return { executar };
}

module.exports = { criarComandosNovos };
