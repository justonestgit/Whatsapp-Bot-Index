const { Client, LocalAuth, MessageMedia, Poll } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const GIFEncoder = require('gif-encoder-2');
const ytSearch = require('yt-search');
const ytdlp = require('youtube-dl-exec');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');
const os = require('os');

const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath:
            'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});

const PREFIXO = ';';
const NOME_BOT = 'JUST BOT';
const VERSAO = '3.18';
const SHAZAM_API_KEY = process.env.SHAZAM_API_KEY || '';
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';

const jogosAdivinhacao = new Map();
const quizzes = new Map();
const mutados = new Map();
const blacklistMute = new Set();
const soAdmGrupos = new Set();
const casamentos = new Map();
const propostasCasamento = new Map();
const confirmacoesDivorcio = new Map();
const familias = new Map();
const propostasAdocao = new Map();
const participantesGrupos =
    new Map();
const piadas = [];
const confirmacoesLimparPiadas = new Map();
const usuariosAFK = new Map();
const avisos = new Map();
const confirmacoesRemoverAviso = new Map();

const dadosXP = new Map();
const moedasUsuarios = new Map();
const jogosEliminacao = new Map();
const personalidadesGrupos = new Map();
const historicoEconomia = [];
const inventariosEconomia = new Map();
const cooldownsMineracao = new Map();
const cooldownsRoubo = new Map();
const dadosRoubo = new Map();

// ============================================================
// 🎖️ SISTEMA DE CONQUISTAS
// ============================================================

const conquistasUsuarios = new Map();

const CONQUISTAS = {
    primeiroPasso: {
        nome: 'Primeiro Passo',
        emoji: '🌱',
        descricao: 'Ganhe XP pela primeira vez.'
    },

    tagarela: {
        nome: 'Tagarela',
        emoji: '💬',
        descricao: 'Envie 100 mensagens.'
    },

    faladorProfissional: {
        nome: 'Falador Profissional',
        emoji: '🗣️',
        descricao: 'Envie 1.000 mensagens.'
    },

    nivel5: {
        nome: 'Subindo de Nível',
        emoji: '⭐',
        descricao: 'Alcance o nível 5.'
    },

    nivel10: {
        nome: 'Veterano',
        emoji: '🚀',
        descricao: 'Alcance o nível 10.'
    },

    nivel25: {
        nome: 'Lenda',
        emoji: '👑',
        descricao: 'Alcance o nível 25.'
    }
};

const numeroOiAuto = '553298631752@c.us';

let oiAutoAtivo = new Map();


// ========================================
// 💾 SISTEMA DE PERSISTÊNCIA
// ========================================

const pastaDados = './dados';

const arquivoMutados =
    `${pastaDados}/mutados.json`;

const arquivoBlacklist =
    `${pastaDados}/blacklist.json`;

const arquivoSoAdm =
    `${pastaDados}/soadm.json`;
    
const arquivoCasamentos =
    `${pastaDados}/casamentos.json`;

const arquivoPropostasCasamento =
    `${pastaDados}/propostas-casamento.json`;
    
const arquivoFamilias =
    `${pastaDados}/familias.json`;

const arquivoParticipantesGrupos =
    `${pastaDados}/participantes-grupos.json`;

const arquivoPiadas =
    './dados/piadas.json';

const arquivoAFK =
    `${pastaDados}/afk.json`;

const arquivoAvisos = `${pastaDados}/avisos.json`;
const arquivoOiAuto = `${pastaDados}/oi-auto.json`;
const arquivoXP = `${pastaDados}/xp.json`;
const arquivoMoedas = `${pastaDados}/moedas.json`;
const arquivoControleXP =
    `${pastaDados}/xp-controle.json`;

const arquivoPersonalidades =
    `${pastaDados}/personalidades.json`;

const arquivoConquistas =
    `${pastaDados}/conquistas.json`;

// Cria a pasta dados se ela não existir
if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(
        pastaDados,
        { recursive: true }
    );
}

// Carrega os dados salvos
function carregarDados() {

    // MUTADOS
    try {

        if (
            fs.existsSync(
                arquivoMutados
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoMutados,
                        'utf8'
                    )
                );

            for (
                const [grupo, ids]
                of Object.entries(dados)
            ) {

                mutados.set(
                    grupo,
                    new Set(ids)
                );
            }

            console.log(
                '💾 Mutados carregados:',
                mutados.size,
                'grupos'
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar mutados:',
            erro.message
        );
    }

    // BLACKLIST
    try {

        if (
            fs.existsSync(
                arquivoBlacklist
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoBlacklist,
                        'utf8'
                    )
                );

            for (
                const id of dados
            ) {

                blacklistMute.add(id);
            }

            console.log(
                '💾 Blacklist carregada:',
                blacklistMute.size,
                'IDs'
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar blacklist:',
            erro.message
        );
    }


    // CASAMENTOS
    try {

        if (
            fs.existsSync(
                arquivoCasamentos
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoCasamentos,
                        'utf8'
                    )
                );

            for (
                const [id, casamento]
                of Object.entries(dados)
            ) {

                casamentos.set(
                    id,
                    casamento
                );
            }

            console.log(
                '💍 Casamentos carregados:',
                casamentos.size
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar casamentos:',
            erro.message
        );
    }


    // ========================================================
// 💬 CARREGAR OI AUTO
// ========================================================

try {

    if (fs.existsSync(arquivoOiAuto)) {

        const dadosOiAuto =
            JSON.parse(
                fs.readFileSync(
                    arquivoOiAuto,
                    'utf8'
                )
            );

        oiAutoAtivo.clear();

        for (
            const [grupoId, ativo]
            of Object.entries(dadosOiAuto)
        ) {

            if (ativo === true) {
                oiAutoAtivo.set(
                    grupoId,
                    true
                );
            }
        }

    } else {

    }

} catch (erro) {

    console.error(
        '❌ Erro ao carregar OI AUTO:',
        erro
    );

}
    
    // PROPOSTAS DE CASAMENTO
    try {

        if (
            fs.existsSync(
                arquivoPropostasCasamento
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoPropostasCasamento,
                        'utf8'
                    )
                );

            for (
                const [id, proposta]
                of Object.entries(dados)
            ) {

                propostasCasamento.set(
                    id,
                    proposta
                );
            }

            console.log(
                '💌 Propostas carregadas:',
                propostasCasamento.size
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar propostas:',
            erro.message
        );
    }

    // FAMÍLIAS
    try {

        if (
            fs.existsSync(
                arquivoFamilias
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoFamilias,
                        'utf8'
                    )
                );

            for (
                const [id, familia]
                of Object.entries(dados)
            ) {

                familias.set(
                    id,
                    familia
                );
            }

            console.log(
                '👨‍👩‍👧 Famílias carregadas:',
                familias.size
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar famílias:',
            erro.message
        );
    }

        // 👥 PARTICIPANTES DOS GRUPOS
    try {

        if (
            fs.existsSync(
                arquivoParticipantesGrupos
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoParticipantesGrupos,
                        'utf8'
                    )
                );

            participantesGrupos.clear();

            for (
                const [grupo, participantes]
                of Object.entries(dados)
            ) {

                participantesGrupos.set(
                    grupo,
                    new Set(participantes)
                );
            }

            console.log(
                '👥 Participantes carregados:',
                participantesGrupos.size,
                'grupos'
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar participantes:',
            erro.message
        );
    }

// Carregar avisos
if (fs.existsSync(arquivoAvisos)) {
    try {
        const dadosAvisos = JSON.parse(
            fs.readFileSync(arquivoAvisos, 'utf8')
        );

        avisos.clear();

        for (const [grupoId, lista] of Object.entries(dadosAvisos)) {
            if (Array.isArray(lista)) {
                avisos.set(grupoId, lista);
            }
        }

        console.log('🔔 Avisos carregados com sucesso!');
    } catch (erro) {
        console.error('❌ Erro ao carregar avisos:', erro);
    }
}

// ============================================================
// 💤 AFK
// ============================================================

try {

    if (
        fs.existsSync(
            arquivoAFK
        )
    ) {

        const dados =
            JSON.parse(
                fs.readFileSync(
                    arquivoAFK,
                    'utf8'
                )
            );

        usuariosAFK.clear();

        for (
            const [chave, afk]
            of Object.entries(dados)
        ) {

            usuariosAFK.set(
                chave,
                afk
            );
        }

        console.log(
            '💤 AFKs carregados:',
            usuariosAFK.size
        );
    }

} catch (erro) {

    console.log(
        '⚠️ Erro ao carregar AFKs:',
        erro.message
    );
}
    
    
// 😂 PIADAS
    try {

        if (
            fs.existsSync(
                arquivoPiadas
            )
        ) {

            const dados =
                JSON.parse(
                    fs.readFileSync(
                        arquivoPiadas,
                        'utf8'
                    )
                );

            piadas.length = 0;

            for (
                const piada of dados
            ) {

                if (
                    typeof piada === 'string' &&
                    piada.trim()
                ) {

                    piadas.push(
                        piada.trim()
                    );
                }
            }

            console.log(
                '😂 Piadas carregadas:',
                piadas.length
            );
        }

    } catch (erro) {

        console.log(
            '⚠️ Erro ao carregar piadas:',
            erro.message
        );
    }
}
    

// ============================================================
// 💤 SALVAR AFKs
// ============================================================

function salvarAFK() {

    try {

        const dados = {};

        for (
            const [chave, afk]
            of usuariosAFK
        ) {

            dados[chave] =
                afk;
        }

        fs.writeFileSync(
            arquivoAFK,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💤 AFKs salvos!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar AFKs:',
            erro.message
        );
    }
}


// Salva os mutados
function salvarMutados() {

    try {

        const dados = {};

        for (
            const [grupo, ids]
            of mutados
        ) {

            dados[grupo] = [
                ...ids
            ];
        }

        fs.writeFileSync(
            arquivoMutados,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💾 Mutados salvos!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar mutados:',
            erro.message
        );
    }
}


// Salva a blacklist
function salvarBlacklist() {

    try {

        fs.writeFileSync(
            arquivoBlacklist,
            JSON.stringify(
                [
                    ...blacklistMute
                ],
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💾 Blacklist salva!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar blacklist:',
            erro.message
        );

    }
    }


function salvarAvisos() {
    try {
        const dados = {};

        for (const [grupoId, lista] of avisos.entries()) {
            dados[grupoId] = lista;
        }

        fs.writeFileSync(
            arquivoAvisos,
            JSON.stringify(dados, null, 2),
            'utf8'
        );
    } catch (erro) {
        console.error('❌ Erro ao salvar avisos:', erro);
    }
}

// ========================================================
// 💾 SALVAR OI AUTO
// ========================================================

function salvarOiAuto() {

    try {

        const dados = {};

        for (
            const [grupoId, ativo]
            of oiAutoAtivo
        ) {

            if (ativo === true) {
                dados[grupoId] = true;
            }

        }

        fs.writeFileSync(
            arquivoOiAuto,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💾 OI AUTO salvo com sucesso!'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao salvar OI AUTO:',
            erro
        );

    }
}

// ============================================================
// 💍 SALVAR CASAMENTOS
// ============================================================

function salvarCasamentos() {

    try {

        const dados = {};

        for (
            const [id, casamento]
            of casamentos
        ) {

            dados[id] = casamento;
        }

        fs.writeFileSync(
            arquivoCasamentos,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💍 Casamentos salvos!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar casamentos:',
            erro.message
        );
    }
}


// ============================================================
// 💌 SALVAR PROPOSTAS
// ============================================================

function salvarPropostasCasamento() {

    try {

        const dados = {};

        for (
            const [id, proposta]
            of propostasCasamento
        ) {

            dados[id] = proposta;
        }

        fs.writeFileSync(
            arquivoPropostasCasamento,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💌 Propostas de casamento salvas!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar propostas:',
            erro.message
        );
    }
}

// ============================================================
// 👨‍👩‍👧 SALVAR FAMÍLIAS
// ============================================================

function salvarFamilias() {

    try {

        const dados = {};

        for (
            const [id, familia]
            of familias
        ) {

            dados[id] = familia;
        }

        fs.writeFileSync(
            arquivoFamilias,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '👨‍👩‍👧 Famílias salvas!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar famílias:',
            erro.message
        );
    }
}

// ============================================================
// 👥 SALVAR PARTICIPANTES DOS GRUPOS
// ============================================================

function salvarParticipantesGrupos() {

    try {

        const dados = {};

        for (
            const [grupo, participantes]
            of participantesGrupos
        ) {

            dados[grupo] =
                [...participantes];
        }

        fs.writeFileSync(
            arquivoParticipantesGrupos,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💾 Participantes dos grupos salvos!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar participantes:',
            erro.message
        );
    }
}

// ============================================================
// 🎭 SISTEMA DE PERSONALIDADES
// ============================================================

const PERSONALIDADES = {
    normal: {
        nome: 'Normal',
        emoji: '🤖',
        descricao: 'Comportamento padrão do JUST BOT.',
        frase: ''
    },
    amigavel: {
        nome: 'Amigável',
        emoji: '😊',
        descricao: 'Mais simpático e acolhedor.',
        frase: '😊 _Tamo junto!_'
    },
    fofa: {
        nome: 'Fofa',
        emoji: '🥰',
        descricao: 'Carinhosa, doce e cheia de emojis.',
        frase: '🥰 _Espero ter ajudado! 💖_'
    },
    sarcastica: {
        nome: 'Sarcástica',
        emoji: '😏',
        descricao: 'Respostas com uma pitada de ironia.',
        frase: '😏 _Pronto. Agora pode fingir que não sabia._'
    },
    caotica: {
        nome: 'Caótica',
        emoji: '🤪',
        descricao: 'Energia imprevisível e respostas absurdas.',
        frase: '🤪 _Não faço ideia do que aconteceu, mas gostei._'
    },
    seria: {
        nome: 'Séria',
        emoji: '🧐',
        descricao: 'Mais direta, formal e objetiva.',
        frase: '🧐 _Operação concluída._'
    }
};

function salvarPersonalidades() {
    try {
        const dados = {};
        for (const [grupoId, personalidade] of personalidadesGrupos.entries()) {
            if (PERSONALIDADES[personalidade]) {
                dados[grupoId] = personalidade;
            }
        }
        fs.writeFileSync(arquivoPersonalidades, JSON.stringify(dados, null, 2), 'utf8');
    } catch (erro) {
        console.error('❌ Erro ao salvar personalidades:', erro);
    }
}

function carregarPersonalidades() {
    try {
        if (!fs.existsSync(arquivoPersonalidades)) return;
        const dados = JSON.parse(fs.readFileSync(arquivoPersonalidades, 'utf8'));
        personalidadesGrupos.clear();
        for (const [grupoId, personalidade] of Object.entries(dados)) {
            if (PERSONALIDADES[personalidade]) {
                personalidadesGrupos.set(grupoId, personalidade);
            }
        }
        console.log('🎭 Personalidades carregadas:', personalidadesGrupos.size, 'grupos');
    } catch (erro) {
        console.error('❌ Erro ao carregar personalidades:', erro);
    }
}

function obterPersonalidadeGrupo(grupoId) {
    if (!grupoId || !grupoId.endsWith('@g.us')) return 'normal';
    return personalidadesGrupos.get(grupoId) || 'normal';
}

function aplicarPersonalidade(conteudo, grupoId) {
    const personalidade = PERSONALIDADES[obterPersonalidadeGrupo(grupoId)];
    if (!personalidade || !personalidade.frase) return conteudo;
    return `${conteudo}\n\n${personalidade.frase}`;
}

async function definirPersonalidade(message, argumentos) {
    try {
        if (!message.from || !message.from.endsWith('@g.us')) {
            await reagir(message, '❌');
            await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n├✯ *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄*\n│\n├➤ _Esse comando só funciona em grupos._\n│\n┗═•❃༺🎭༻❃•═┓`);
            return;
        }

        if (!(await exigirAdmin(message))) return;

        const escolha = String(argumentos || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!escolha) {
            const atual = obterPersonalidadeGrupo(message.from);
            const atualDados = PERSONALIDADES[atual];
            let lista = '';
            for (const [id, personalidade] of Object.entries(PERSONALIDADES)) {
                lista += `├➤ ${personalidade.emoji} *${id}* — ${personalidade.descricao}\n`;
            }
            await reagir(message, '🎭');
            await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n│      *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄*\n├✯\n│\n├➤ 🎭 Atual: *${atualDados.nome}*\n│\n${lista}\n├✯\n│\n├➤ *𝐔𝐒𝐀𝐑:*\n│   *${PREFIXO}personalidade <nome>*\n│\n├➤ *𝐄𝐗𝐄𝐌𝐏𝐋𝐎:*\n│   *${PREFIXO}personalidade sarcastica*\n│\n┗═•❃༺🎭༻❃•═┛`);
            return;
        }

        if (['desligar', 'desativar', 'off'].includes(escolha)) {
            personalidadesGrupos.delete(message.from);
            salvarPersonalidades();
            await reagir(message, '🔴');
            await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n├✯ *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄*\n│\n├➤ 🔴 _Personalidade desativada._\n├➤ O JUST BOT voltou ao comportamento *Normal*.\n│\n┗═•❃༺🎭༻❃•═┓`);
            return;
        }

        const personalidade = PERSONALIDADES[escolha];
        if (!personalidade) {
            await reagir(message, '❌');
            await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n├✯ *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀*\n│\n├➤ _Essa personalidade não existe._\n│\n├➤ Use *${PREFIXO}personalidades* para ver as opções.\n│\n┗═•❃༺🎭༻❃•═┓`);
            return;
        }

        personalidadesGrupos.set(message.from, escolha);
        salvarPersonalidades();
        await reagir(message, personalidade.emoji);
        await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n├✯ *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄 𝐀𝐓𝐈𝐕𝐀*\n│\n├➤ ${personalidade.emoji} *${personalidade.nome}*\n│\n├➤ _${personalidade.descricao}_\n│\n├➤ Essa personalidade agora está ativa neste grupo.\n│\n┗═•❃༺🎭༻❃•═┓`);
    } catch (erro) {
        console.error('❌ Erro ao definir personalidade:', erro);
        await reagir(message, '❌');
    }
}

async function listarPersonalidades(message) {
    const atual = obterPersonalidadeGrupo(message.from);
    const atualDados = PERSONALIDADES[atual];
    let lista = '';
    for (const [id, personalidade] of Object.entries(PERSONALIDADES)) {
        const marcador = id === atual ? '✅' : '▫️';
        lista += `├➤ ${marcador} ${personalidade.emoji} *${id}*\n│   _${personalidade.descricao}_\n`;
    }
    await reagir(message, '🎭');
    await responderCitando(message, `┏═•❃༺🎭༻❃•═┓\n│      *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄𝐒*\n├✯\n│\n├➤ 🎭 Atual: *${atualDados.nome}*\n│\n${lista}\n├✯\n│\n├➤ Para alterar, um administrador deve usar:\n│   *${PREFIXO}personalidade <nome>*\n│\n┗═•❃༺🎭༻❃•═┓`);
}

carregarPersonalidades();

// Carrega tudo ao iniciar
// ============================================================
// 🔒 SISTEMA SOMENTE ADM
// ============================================================

function carregarSoAdm() {
    try {
        if (!fs.existsSync(arquivoSoAdm)) return;

        const dados = JSON.parse(
            fs.readFileSync(arquivoSoAdm, 'utf8')
        );

        for (const grupoId of dados) {
            if (typeof grupoId === 'string' && grupoId.endsWith('@g.us')) {
                soAdmGrupos.add(grupoId);
            }
        }

        console.log(
            '🔒 Grupos em modo somente ADM carregados:',
            soAdmGrupos.size
        );
    } catch (erro) {
        console.error('⚠️ Erro ao carregar modo somente ADM:', erro.message);
    }
}

function salvarSoAdm() {
    try {
        fs.writeFileSync(
            arquivoSoAdm,
            JSON.stringify([...soAdmGrupos], null, 2),
            'utf8'
        );

        console.log('💾 Modo somente ADM salvo!');
    } catch (erro) {
        console.error('❌ Erro ao salvar modo somente ADM:', erro.message);
    }
}

carregarSoAdm();

async function usuarioEhAdminDoGrupo(message) {
    try {
        const chatId = message?.from;

        if (!chatId || !chatId.endsWith('@g.us')) {
            return false;
        }

        const idRemetente = obterIdRemetente(message);
        if (!idRemetente) return false;

        const dadosChat = await client.pupPage.evaluate((grupoId) => {
            try {
                const Store = window.require('WAWebCollections');

                if (!Store?.Chat) {
                    return null;
                }

                const chat = Store.Chat.get(grupoId);
                if (!chat) {
                    return null;
                }

                const participantes = chat.groupMetadata?.participants;
                if (!participantes) {
                    return null;
                }

                let modelos = [];

                if (typeof participantes.getModelsArray === 'function') {
                    modelos = participantes.getModelsArray();
                } else if (Array.isArray(participantes.models)) {
                    modelos = participantes.models;
                }

                return modelos.map(participante => ({
                    id:
                        participante.id?._serialized ||
                        participante.id?.toString?.() ||
                        null,
                    isAdmin: !!participante.isAdmin,
                    isSuperAdmin: !!participante.isSuperAdmin
                }));
            } catch (erro) {
                return null;
            }
        }, chatId);

        if (!Array.isArray(dadosChat)) {
            return false;
        }

        const participante = dadosChat.find(item =>
            item.id && idsIguais(item.id, idRemetente)
        );

        return !!(
            participante &&
            (participante.isAdmin || participante.isSuperAdmin)
        );
    } catch (erro) {
        console.error(
            '❌ Erro ao verificar administrador no modo somente ADM:',
            erro
        );
        return false;
    }
}

async function soAdm(message) {
    try {
        const chatId = message?.from;

        if (!chatId || !chatId.endsWith('@g.us')) {
            await reagir(message, '❌');
            await responderCitando(
                message,
                '❌ _O ;soadm só funciona em grupos._'
            );
            return;
        }

        const admin = await usuarioEhAdminDoGrupo(message);

        if (!admin) {
            await reagir(message, '❌');
            await responderCitando(
                message,
                '❌ _Apenas administradores do grupo podem ativar ou desativar o modo somente ADM._'
            );
            return;
        }

        if (soAdmGrupos.has(chatId)) {
            soAdmGrupos.delete(chatId);
            salvarSoAdm();

            await reagir(message, '🔓');
            await responderCitando(
                message,
                `┏═•❃༺🔓༻❃•═┓
├✯ *𝐌𝐎𝐃𝐎 𝐒𝐎𝐌𝐄𝐍𝐓𝐄 𝐀𝐃𝐌 𝐃𝐄𝐒𝐀𝐓𝐈𝐕𝐀𝐃𝐎*
│
├➤ _Todos os membros podem usar os comandos novamente._
│
├➤ 👑 _Administradores continuam sujeitos às permissões específicas de cada comando._
│
┗═•❃༺🔓༻❃•═┛`
            );
            return;
        }

        soAdmGrupos.add(chatId);
        salvarSoAdm();

        await reagir(message, '🔒');
        await responderCitando(
            message,
            `┏═•❃༺🔒༻❃•═┓
├✯ *𝐌𝐎𝐃𝐎 𝐒𝐎𝐌𝐄𝐍𝐓𝐄 𝐀𝐃𝐌 𝐀𝐓𝐈𝐕𝐀𝐃𝐎*
│
├➤ 👑 _Agora apenas administradores do grupo podem usar os comandos._
│
├➤ 🔁 _Use ${PREFIXO}soadm novamente para desativar._
│
┗═•❃༺🔒༻❃•═┛`
        );
    } catch (erro) {
        console.error('❌ Erro no modo somente ADM:', erro);
        await reagir(message, '❌');
        await responderCitando(
            message,
            '❌ _Não foi possível alterar o modo somente ADM._'
        );
    }
}

carregarDados();

// ============================================================
// ✨ SISTEMA DE XP
// ============================================================

const XP_POR_MENSAGEM = 5;

function calcularNivel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function garantirDadosXP(grupoId, usuarioId) {

    if (!dadosXP.has(grupoId)) {
        dadosXP.set(
            grupoId,
            new Map()
        );
    }

    const grupo =
        dadosXP.get(grupoId);

    if (!grupo.has(usuarioId)) {

        grupo.set(
            usuarioId,
            {
                mensagens: 0,
                xp: 0,
                nivel: 1
            }
        );
    }

    return grupo.get(usuarioId);
}

function adicionarXP(
    grupoId,
    usuarioId,
    quantidade = XP_POR_MENSAGEM
) {

    if (
        !grupoId ||
        !usuarioId
    ) {
        return null;
    }

    const dados =
        garantirDadosXP(
            grupoId,
            usuarioId
        );

    const nivelAnterior =
        dados.nivel;

    dados.mensagens += 1;
    dados.xp += quantidade;

    dados.nivel =
        calcularNivel(
            dados.xp
        );

    return {
        ...dados,

        subiuNivel:
            dados.nivel >
            nivelAnterior,

        nivelAnterior
    };
}

function salvarXP() {

    try {

        const objeto = {};

        for (
            const [grupoId, usuarios]
            of dadosXP.entries()
        ) {

            objeto[grupoId] = {};

            for (
                const [usuarioId, dados]
                of usuarios.entries()
            ) {

                objeto[grupoId][usuarioId] =
                    dados;
            }
        }

        fs.writeFileSync(
            arquivoXP,
            JSON.stringify(
                objeto,
                null,
                2
            ),
            'utf8'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao salvar XP:',
            erro
        );
    }
}

function carregarXP() {

    try {

        if (
            !fs.existsSync(
                arquivoXP
            )
        ) {
            return;
        }

        const dados =
            JSON.parse(
                fs.readFileSync(
                    arquivoXP,
                    'utf8'
                )
            );

        for (
            const [grupoId, usuarios]
            of Object.entries(dados)
        ) {

            const mapaUsuarios =
                new Map();

            for (
                const [usuarioId, dadosUsuario]
                of Object.entries(usuarios)
            ) {

                const xp =
                    Number(
                        dadosUsuario.xp
                    ) || 0;

                mapaUsuarios.set(
                    usuarioId,
                    {
                        mensagens:
                            Number(
                                dadosUsuario.mensagens
                            ) || 0,

                        xp: xp,

                        nivel:
                            Number(
                                dadosUsuario.nivel
                            ) ||
                            calcularNivel(xp)
                    }
                );
            }

            dadosXP.set(
                grupoId,
                mapaUsuarios
            );
        }

        console.log(
            '✨ Sistema de XP carregado!'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao carregar XP:',
            erro
        );
    }
}

function formatarMoedas(valor) {
    return Math.max(0, Math.floor(Number(valor) || 0)).toLocaleString('pt-BR');
}

function obterInventario(usuarioId) {
    if (!usuarioId) return null;
    if (!inventariosEconomia.has(usuarioId)) {
        inventariosEconomia.set(usuarioId, {});
    }
    return inventariosEconomia.get(usuarioId);
}

function quantidadeItem(usuarioId, item) {
    return Number(obterInventario(usuarioId)?.[item] || 0);
}

function adicionarItem(usuarioId, item, quantidade = 1) {
    const inventario = obterInventario(usuarioId);
    inventario[item] = Math.max(0, quantidadeItem(usuarioId, item) + quantidade);
    return inventario[item];
}

function consumirItem(usuarioId, item, quantidade = 1) {
    if (quantidadeItem(usuarioId, item) < quantidade) return false;
    adicionarItem(usuarioId, item, -quantidade);
    return true;
}

function registrarTransacao(tipo, de, para, valor, detalhes = '') {
    historicoEconomia.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tipo,
        de: de || null,
        para: para || null,
        valor: Math.max(0, Math.floor(Number(valor) || 0)),
        detalhes,
        data: new Date().toISOString()
    });

    if (historicoEconomia.length > 500) {
        historicoEconomia.splice(0, historicoEconomia.length - 500);
    }
}

const economiaIdentidades = new Map();

function salvarMoedas() {
    try {
        const usuarios = {};
        for (const [usuarioId, carteira] of moedasUsuarios.entries()) {
            usuarios[usuarioId] = {
                saldo: Math.max(0, Math.floor(Number(carteira.saldo) || 0)),
                ultimoDiario: Number(carteira.ultimoDiario) || 0,
                mineracoes: Number(carteira.mineracoes) || 0,
                roubosSucesso: Number(carteira.roubosSucesso) || 0
            };
        }

        const inventarios = {};
        for (const [usuarioId, inventario] of inventariosEconomia.entries()) {
            inventarios[usuarioId] = inventario;
        }

        fs.writeFileSync(
            arquivoMoedas,
            JSON.stringify({
                usuarios,
                inventarios,
                transacoes: historicoEconomia,
                identidades: Object.fromEntries(economiaIdentidades),
                cooldowns: {
                    mineracao: Object.fromEntries(cooldownsMineracao),
                    roubo: Object.fromEntries(cooldownsRoubo)
                }
            }, null, 2),
            'utf8'
        );
    } catch (erro) {
        console.error('❌ Erro ao salvar economia:', erro);
    }
}

function carregarMoedas() {
    try {
        if (!fs.existsSync(arquivoMoedas)) return;

        const dados = JSON.parse(fs.readFileSync(arquivoMoedas, 'utf8'));
        moedasUsuarios.clear();
        inventariosEconomia.clear();
        historicoEconomia.length = 0;
        economiaIdentidades.clear();

        if (dados?.identidades && typeof dados.identidades === 'object') {
            for (const [alias, canonico] of Object.entries(dados.identidades)) {
                if (alias && canonico) economiaIdentidades.set(alias, canonico);
            }
        }

        const usuarios = dados?.usuarios && typeof dados.usuarios === 'object'
            ? dados.usuarios
            : dados;

        for (const [usuarioId, carteira] of Object.entries(usuarios || {})) {
            if (usuarioId === 'usuarios' || usuarioId === 'inventarios' || usuarioId === 'transacoes') continue;

            if (typeof carteira === 'number') {
                moedasUsuarios.set(usuarioId, {
                    saldo: Math.max(0, carteira),
                    ultimoDiario: 0,
                    mineracoes: 0,
                    roubosSucesso: 0
                });
                continue;
            }

            if (carteira && typeof carteira === 'object') {
                moedasUsuarios.set(usuarioId, {
                    saldo: Math.max(0, Number(carteira.saldo) || 0),
                    ultimoDiario: Number(carteira.ultimoDiario) || 0,
                    mineracoes: Number(carteira.mineracoes) || 0,
                    roubosSucesso: Number(carteira.roubosSucesso) || 0
                });
            }
        }

        if (dados?.inventarios && typeof dados.inventarios === 'object') {
            for (const [usuarioId, inventario] of Object.entries(dados.inventarios)) {
                inventariosEconomia.set(usuarioId, inventario || {});
            }
        }

        if (Array.isArray(dados?.transacoes)) {
            historicoEconomia.push(...dados.transacoes.slice(-500));
        }

        const agora = Date.now();
        if (dados?.cooldowns?.mineracao && typeof dados.cooldowns.mineracao === 'object') {
            for (const [usuarioId, timestamp] of Object.entries(dados.cooldowns.mineracao)) {
                const valor = Number(timestamp);
                if (usuarioId && Number.isFinite(valor) && valor > 0 && agora - valor < 24 * 60 * 60 * 1000) {
                    cooldownsMineracao.set(usuarioId, valor);
                }
            }
        }

        if (dados?.cooldowns?.roubo && typeof dados.cooldowns.roubo === 'object') {
            for (const [chave, timestamp] of Object.entries(dados.cooldowns.roubo)) {
                const valor = Number(timestamp);
                if (chave && Number.isFinite(valor) && valor > 0 && agora - valor < 24 * 60 * 60 * 1000) {
                    cooldownsRoubo.set(chave, valor);
                }
            }
        }

        for (const [alias, canonico] of economiaIdentidades.entries()) {
            if (alias !== canonico) migrarCarteiraEconomia(alias, canonico);
        }

        const cooldownsMineracaoNormalizados = new Map();
        for (const [usuarioId, timestamp] of cooldownsMineracao.entries()) {
            const canonico = economiaIdentidades.get(usuarioId) || usuarioId;
            const anterior = cooldownsMineracaoNormalizados.get(canonico) || 0;
            cooldownsMineracaoNormalizados.set(canonico, Math.max(anterior, timestamp));
        }
        cooldownsMineracao.clear();
        for (const [usuarioId, timestamp] of cooldownsMineracaoNormalizados.entries()) {
            cooldownsMineracao.set(usuarioId, timestamp);
        }

        const cooldownsRouboNormalizados = new Map();
        for (const [chave, timestamp] of cooldownsRoubo.entries()) {
            const partes = String(chave).split(':');
            if (partes.length !== 2) continue;
            const ladrao = economiaIdentidades.get(partes[0]) || partes[0];
            const vitima = partes[1] === 'geral'
                ? 'geral'
                : (economiaIdentidades.get(partes[1]) || partes[1]);
            const chaveNormalizada = `${ladrao}:${vitima}`;
            const anterior = cooldownsRouboNormalizados.get(chaveNormalizada) || 0;
            cooldownsRouboNormalizados.set(chaveNormalizada, Math.max(anterior, timestamp));
        }
        cooldownsRoubo.clear();
        for (const [chave, timestamp] of cooldownsRouboNormalizados.entries()) {
            cooldownsRoubo.set(chave, timestamp);
        }

        console.log('💰 Economia carregada:', moedasUsuarios.size, 'usuários');
    } catch (erro) {
        console.error('❌ Erro ao carregar economia:', erro);
    }
}

// ============================================================
// 🪪 IDENTIDADE DAS CARTEIRAS
// Mantém LID e JID da mesma pessoa na mesma carteira.
// Nunca assume que dois números são iguais sem confirmação do WhatsApp.
// ============================================================

function normalizarIdEconomia(id) {
    if (!id) return null;
    if (typeof id === 'object') {
        return id.id?._serialized || id.id?.$1 || id._serialized || null;
    }
    return String(id);
}

function escolherIdEconomia(ids, preferido = null) {
    const lista = [...new Set((ids || []).map(normalizarIdEconomia).filter(Boolean))];
    const telefone = lista.find(id => id.endsWith('@c.us'));
    if (telefone) return telefone;
    const preferidoNormalizado = normalizarIdEconomia(preferido);
    if (preferidoNormalizado) return preferidoNormalizado;
    return lista[0] || null;
}

function encontrarCarteiraEconomia(usuarioId) {
    const id = normalizarIdEconomia(usuarioId);
    if (!id) return null;
    const canonico = economiaIdentidades.get(id) || id;
    if (moedasUsuarios.has(canonico)) return canonico;
    if (moedasUsuarios.has(id)) return id;
    return null;
}

function migrarCarteiraEconomia(origem, destino) {
    if (!origem || !destino || origem === destino) return;

    const carteiraOrigem = moedasUsuarios.get(origem);
    const carteiraDestino = moedasUsuarios.get(destino);

    if (carteiraOrigem) {
        if (carteiraDestino) {
            carteiraDestino.saldo = Math.max(0, Number(carteiraDestino.saldo) || 0) + Math.max(0, Number(carteiraOrigem.saldo) || 0);
            carteiraDestino.mineracoes = (Number(carteiraDestino.mineracoes) || 0) + (Number(carteiraOrigem.mineracoes) || 0);
            carteiraDestino.roubosSucesso = (Number(carteiraDestino.roubosSucesso) || 0) + (Number(carteiraOrigem.roubosSucesso) || 0);
            moedasUsuarios.delete(origem);
        } else {
            moedasUsuarios.set(destino, carteiraOrigem);
            moedasUsuarios.delete(origem);
        }
    }

    const inventarioOrigem = inventariosEconomia.get(origem);
    const inventarioDestino = inventariosEconomia.get(destino);

    if (inventarioOrigem) {
        if (inventarioDestino) {
            for (const [item, quantidade] of Object.entries(inventarioOrigem)) {
                inventarioDestino[item] = (Number(inventarioDestino[item]) || 0) + (Number(quantidade) || 0);
            }
            inventariosEconomia.delete(origem);
        } else {
            inventariosEconomia.set(destino, inventarioOrigem);
            inventariosEconomia.delete(origem);
        }
    }
}

function registrarIdentidadeEconomia(ids, preferido = null) {
    const lista = [...new Set((ids || []).map(normalizarIdEconomia).filter(Boolean))];
    const canonico = escolherIdEconomia(lista, preferido);
    if (!canonico) return null;

    for (const id of lista) {
        const antigoCanonico = economiaIdentidades.get(id);
        if (antigoCanonico && antigoCanonico !== canonico) {
            migrarCarteiraEconomia(antigoCanonico, canonico);
        }
        if (id !== canonico && moedasUsuarios.has(id)) {
            migrarCarteiraEconomia(id, canonico);
        }
        economiaIdentidades.set(id, canonico);
    }

    economiaIdentidades.set(canonico, canonico);
    return canonico;
}

async function resolverIdEconomia(usuarioIdOuContato) {
    const original = normalizarIdEconomia(usuarioIdOuContato);
    if (!original) return null;

    const conhecido = economiaIdentidades.get(original);
    if (conhecido) return conhecido;

    let ids = new Set([original]);

    try {
        if (typeof usuarioIdOuContato === 'object') {
            ids = await obterIdsPessoa(usuarioIdOuContato);
        } else if (original.endsWith('@c.us')) {
            ids = await obterIdsPessoa(original);
        } else {
            const contato = await client.getContactById(original);
            if (contato) ids = await obterIdsPessoa(contato);
        }
    } catch (erro) {
        console.log('⚠️ Não foi possível resolver identidade da carteira:', erro?.message || erro);
    }

    return registrarIdentidadeEconomia([...ids], original);
}

function obterCarteiraEconomia(usuarioId) {
    if (!usuarioId) return null;

    const original = normalizarIdEconomia(usuarioId);
    const id = economiaIdentidades.get(original) || original;
    if (!id) return null;

    const carteira = moedasUsuarios.get(id);
    if (!carteira) return null;

    carteira.saldo = Math.max(0, Math.floor(Number(carteira.saldo) || 0));
    carteira.mineracoes = Number(carteira.mineracoes) || 0;
    carteira.roubosSucesso = Number(carteira.roubosSucesso) || 0;
    return carteira;
}

function garantirCarteira(usuarioId) {
    if (!usuarioId) return null;

    const original = normalizarIdEconomia(usuarioId);
    const id = economiaIdentidades.get(original) || original;
    if (!id) return null;

    if (!moedasUsuarios.has(id)) {
        moedasUsuarios.set(id, {
            saldo: MOEDAS_INICIAIS,
            ultimoDiario: 0,
            mineracoes: 0,
            roubosSucesso: 0
        });
        registrarTransacao('carteira_inicial', null, id, MOEDAS_INICIAIS, 'Saldo inicial da economia');
    }

    const carteira = moedasUsuarios.get(id);
    carteira.saldo = Math.max(0, Math.floor(Number(carteira.saldo) || 0));
    carteira.mineracoes = Number(carteira.mineracoes) || 0;
    carteira.roubosSucesso = Number(carteira.roubosSucesso) || 0;
    obterInventario(id);
    return carteira;
}

function transferirMoedas(de, para, valor, tipo = 'transferencia', detalhes = '') {
    valor = Math.floor(Number(valor) || 0);
    if (valor <= 0 || !de || !para || de === para) return false;

    const carteiraDe = garantirCarteira(de);
    const carteiraPara = garantirCarteira(para);

    if (carteiraDe.saldo < valor) return false;

    carteiraDe.saldo -= valor;
    carteiraPara.saldo += valor;
    registrarTransacao(tipo, de, para, valor, detalhes);
    salvarMoedas();
    return true;
}

const MOEDAS_INICIAIS = 1000;
const INTERVALO_MINERACAO = 60 * 1000;
const INTERVALO_ROUBO = 5 * 60 * 1000;
const INTERVALO_MESMA_VITIMA = 6 * 60 * 60 * 1000;

const ITENS_LOJA = {
    picareta: {
        nome: 'Picareta Reforçada',
        emoji: '⛏️',
        preco: 1200,
        descricao: 'Reduz o cooldown da mineração e aumenta seus ganhos.'
    },
    luvas: {
        nome: 'Luvas de Ladrão',
        emoji: '🥷',
        preco: 1500,
        descricao: 'Aumenta sua chance de escapar quando tentar roubar.'
    },
    colete: {
        nome: 'Colete Anti-Punição',
        emoji: '🛡️',
        preco: 2000,
        descricao: 'Protege uma vez contra a punição de ser pego duas vezes.'
    }
};

carregarMoedas();

carregarXP();

// ============================================================
// 🎖️ CARREGAR CONQUISTAS
// ============================================================

function carregarConquistas() {

    try {

        if (
            !fs.existsSync(
                arquivoConquistas
            )
        ) {
            return;
        }

        const dados =
            JSON.parse(
                fs.readFileSync(
                    arquivoConquistas,
                    'utf8'
                )
            );

        conquistasUsuarios.clear();

        for (
            const [
                usuarioId,
                conquistas
            ] of Object.entries(dados)
        ) {

            if (
                Array.isArray(conquistas)
            ) {
                conquistasUsuarios.set(
                    usuarioId,
                    new Set(conquistas)
                );
            }
        }

        console.log(
            '🎖️ Conquistas carregadas:',
            conquistasUsuarios.size,
            'usuários'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao carregar conquistas:',
            erro
        );
    }
}


// ============================================================
// 🎖️ SALVAR CONQUISTAS
// ============================================================

function salvarConquistas() {

    try {

        const dados = {};

        for (
            const [
                usuarioId,
                conquistas
            ] of conquistasUsuarios.entries()
        ) {

            dados[usuarioId] = [
                ...conquistas
            ];
        }

        fs.writeFileSync(
            arquivoConquistas,
            JSON.stringify(
                dados,
                null,
                2
            ),
            'utf8'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao salvar conquistas:',
            erro
        );
    }
}


carregarConquistas();

// ============================================================
// 🎖️ DADOS DE CONQUISTAS DO USUÁRIO
// ============================================================

function garantirConquistasUsuario(
    usuarioId
) {

    if (
        !conquistasUsuarios.has(
            usuarioId
        )
    ) {

        conquistasUsuarios.set(
            usuarioId,
            new Set()
        );
    }

    return conquistasUsuarios.get(
        usuarioId
    );
}


// ============================================================
// 🎖️ VERIFICAR SE USUÁRIO POSSUI CONQUISTA
// ============================================================

function possuiConquista(
    usuarioId,
    conquistaId
) {

    const conquistas =
        conquistasUsuarios.get(
            usuarioId
        );

    return !!(
        conquistas &&
        conquistas.has(
            conquistaId
        )
    );
}


// ============================================================
// 🎖️ DESBLOQUEAR CONQUISTA
// ============================================================

function desbloquearConquista(
    usuarioId,
    conquistaId
) {

    const conquista =
        CONQUISTAS[
            conquistaId
        ];

    if (!conquista) {
        return false;
    }

    const conquistas =
        garantirConquistasUsuario(
            usuarioId
        );

    if (
        conquistas.has(
            conquistaId
        )
    ) {
        return false;
    }

    conquistas.add(
        conquistaId
    );

    salvarConquistas();

    console.log(
        `🎖️ Conquista desbloqueada: ${conquista.nome} → ${usuarioId}`
    );

    return true;
}

// ============================================================
// 🎖️ VERIFICAR CONQUISTAS DO USUÁRIO
// ============================================================

function verificarConquistas(
    usuarioId,
    dadosUsuario
) {

    const novasConquistas = [];

    if (!dadosUsuario) {
        return novasConquistas;
    }

    // ========================================================
    // 🌱 PRIMEIRO PASSO
    // ========================================================

    if (
        Number(dadosUsuario.xp) > 0 &&
        !possuiConquista(
            usuarioId,
            'primeiroPasso'
        )
    ) {

        if (
            desbloquearConquista(
                usuarioId,
                'primeiroPasso'
            )
        ) {

            novasConquistas.push(
                'primeiroPasso'
            );
        }
    }

    // ========================================================
    // 💬 TAGARELA
    // ========================================================

    if (
        Number(dadosUsuario.mensagens) >= 100 &&
        !possuiConquista(
            usuarioId,
            'tagarela'
        )
    ) {

        if (
            desbloquearConquista(
                usuarioId,
                'tagarela'
            )
        ) {

            novasConquistas.push(
                'tagarela'
            );
        }
    }

// ========================================================
// 🗣️ FALADOR PROFISSIONAL
// ========================================================

if (
    Number(dadosUsuario.mensagens) >= 1000 &&
    !possuiConquista(
        usuarioId,
        'faladorProfissional'
    )
) {

    if (
        desbloquearConquista(
            usuarioId,
            'faladorProfissional'
        )
    ) {

        novasConquistas.push(
            'faladorProfissional'
        );
    }
}
    
// ========================================================
// ⭐ SUBINDO DE NÍVEL
// ========================================================

if (
    Number(dadosUsuario.nivel) >= 5 &&
    !possuiConquista(
        usuarioId,
        'nivel5'
    )
) {

    if (
        desbloquearConquista(
            usuarioId,
            'nivel5'
        )
    ) {

        novasConquistas.push(
            'nivel5'
        );
    }
}    

// ========================================================
// 🚀 VETERANO
// ========================================================

if (
    Number(dadosUsuario.nivel) >= 10 &&
    !possuiConquista(
        usuarioId,
        'nivel10'
    )
) {

    if (
        desbloquearConquista(
            usuarioId,
            'nivel10'
        )
    ) {

        novasConquistas.push(
            'nivel10'
        );
    }
}    

// ========================================================
// 👑 LENDA
// ========================================================

if (
    Number(dadosUsuario.nivel) >= 25 &&
    !possuiConquista(
        usuarioId,
        'nivel25'
    )
) {

    if (
        desbloquearConquista(
            usuarioId,
            'nivel25'
        )
    ) {

        novasConquistas.push(
            'nivel25'
        );
    }
}

return novasConquistas;
}


// ============================================================
// 💤 CONTROLE DE XP OFFLINE
// ============================================================

const controleXP = new Map();

function salvarControleXP() {

    try {

        const objeto = {};

        for (
            const [grupoId, timestamp]
            of controleXP.entries()
        ) {

            objeto[grupoId] =
                timestamp;
        }

        fs.writeFileSync(
            arquivoControleXP,
            JSON.stringify(
                objeto,
                null,
                2
            ),
            'utf8'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao salvar controle do XP:',
            erro
        );
    }
}

function carregarControleXP() {

    try {

        if (
            !fs.existsSync(
                arquivoControleXP
            )
        ) {
            return;
        }

        const dados =
            JSON.parse(
                fs.readFileSync(
                    arquivoControleXP,
                    'utf8'
                )
            );

        for (
            const [grupoId, timestamp]
            of Object.entries(dados)
        ) {

            controleXP.set(
                grupoId,
                Number(timestamp) || 0
            );
        }

        console.log(
            '💤 Controle de XP offline carregado!'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao carregar controle de XP:',
            erro
        );
    }
}

carregarControleXP();


// ============================================================
// 💤 OBTER MENSAGENS DO GRUPO DIRETAMENTE DO WHATSAPP WEB
// Evita client.getChatById() e fetchMessages()
// ============================================================

async function obterMensagensGrupoDireto(
    grupoId,
    limite = 1000
) {

    try {

        const resultado =
            await client.pupPage.evaluate(
                async (
                    chatId,
                    limiteMensagens
                ) => {

                    try {

                        const Collections =
                            window.require(
                                'WAWebCollections'
                            );

                        if (!Collections) {
                            return {
                                sucesso: false,
                                erro:
                                    'WAWebCollections não disponível.'
                            };
                        }

                        const Chat =
                            Collections.Chat;

                        if (!Chat) {
                            return {
                                sucesso: false,
                                erro:
                                    'Coleção Chat não disponível.'
                            };
                        }

                        // ====================================================
                        // TENTAR PEGAR O CHAT DIRETAMENTE DA COLEÇÃO
                        // ====================================================

                        let chat =
                            Chat.get(chatId);

                        // Caso não esteja carregado,
                        // tentar localizar pelo WID
                        if (!chat) {

                            try {

                                const WidFactory =
                                    window.require(
                                        'WAWebWidFactory'
                                    );

                                const wid =
                                    WidFactory.createWid(
                                        chatId
                                    );

                                if (wid) {

                                    chat =
                                        await Chat.find(
                                            wid
                                        );
                                }

                            } catch (erroFind) {

                                console.log(
                                    '⚠️ Chat.find falhou:',
                                    String(
                                        erroFind?.message ||
                                        erroFind
                                    )
                                );
                            }
                        }

                        if (!chat) {

                            return {
                                sucesso: false,
                                erro:
                                    'Grupo não encontrado na coleção do WhatsApp.'
                            };
                        }

                        // ====================================================
                        // PEGAR MENSAGENS JÁ CARREGADAS
                        // ====================================================

                        let mensagens =
                            chat.msgs &&
                            typeof chat.msgs.getModelsArray ===
                                'function'
                                ? chat.msgs.getModelsArray()
                                : [];

                        // ====================================================
                        // TENTAR CARREGAR MENSAGENS ANTIGAS
                        // ====================================================

                        if (
                            mensagens.length <
                            limiteMensagens
                        ) {

                            try {

                                const LoadMessages =
                                    window.require(
                                        'WAWebChatLoadMessages'
                                    );

                                if (
                                    LoadMessages &&
                                    typeof LoadMessages
                                        .loadEarlierMsgs ===
                                        'function'
                                ) {

                                    let tentativas = 0;

                                    while (
                                        mensagens.length <
                                            limiteMensagens &&
                                        tentativas < 20
                                    ) {

                                        const anteriores =
                                            await LoadMessages
                                                .loadEarlierMsgs({
                                                    chat
                                                });

                                        if (
                                            !anteriores ||
                                            !anteriores.length
                                        ) {
                                            break;
                                        }

                                        mensagens =
                                            chat.msgs &&
                                            typeof chat.msgs
                                                .getModelsArray ===
                                                'function'
                                                ? chat.msgs
                                                    .getModelsArray()
                                                : mensagens;

                                        tentativas++;
                                    }
                                }

                            } catch (erroHistorico) {

                                console.log(
                                    '⚠️ Não foi possível carregar mensagens antigas:',
                                    String(
                                        erroHistorico?.message ||
                                        erroHistorico
                                    )
                                );
                            }
                        }

                        // ====================================================
                        // LIMITAR ÀS ÚLTIMAS MENSAGENS
                        // ====================================================

                        mensagens =
                            mensagens
                                .sort(
                                    (a, b) =>
                                        (a.t || 0) -
                                        (b.t || 0)
                                )
                                .slice(
                                    -limiteMensagens
                                );

                        // ====================================================
                        // CONVERTER PARA DADOS SIMPLES
                        // ====================================================

                        const resultadoMensagens =
                            mensagens.map(
                                mensagem => {

                                    let autor = null;

                                    try {

                                        autor =
                                            mensagem.author?._serialized ||
                                            mensagem.author?.toString?.() ||
                                            null;

                                    } catch {}

                                    if (
                                        !autor &&
                                        mensagem.author
                                    ) {
                                        autor =
                                            String(
                                                mensagem.author
                                            );
                                    }

                                    let from = null;

                                    try {

                                        from =
                                            mensagem.from?._serialized ||
                                            mensagem.from?.toString?.() ||
                                            null;

                                    } catch {}

                                    if (
                                        !from &&
                                        mensagem.from
                                    ) {
                                        from =
                                            String(
                                                mensagem.from
                                            );
                                    }

                                    return {

                                        timestamp:
                                            Number(
                                                mensagem.t
                                            ) || 0,

                                        fromMe:
                                            mensagem.id
                                                ?.fromMe ===
                                            true,

                                        type:
                                            mensagem.type ||
                                            null,

                                        isNotification:
                                            !!mensagem
                                                .isNotification,

                                        author:
                                            autor,

                                        from:
                                            from
                                    };
                                }
                            );

                        return {
                            sucesso: true,
                            mensagens:
                                resultadoMensagens
                        };

                    } catch (erro) {

                        return {
                            sucesso: false,
                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )
                        };
                    }

                },
                grupoId,
                limite
            );

        if (
            !resultado ||
            !resultado.sucesso
        ) {

            console.log(
                `⚠️ Não foi possível obter mensagens do grupo ${grupoId}:`,
                resultado?.erro ||
                    'erro desconhecido'
            );

            return [];
        }

        return (
            resultado.mensagens ||
            []
        );

    } catch (erro) {

        console.error(
            `❌ Erro ao acessar mensagens diretamente do grupo ${grupoId}:`,
            erro
        );

        return [];
    }
}

// ============================================================
// 💤 PROCESSAR MENSAGENS ENVIADAS ENQUANTO O BOT ESTAVA OFFLINE
// ============================================================

async function processarXPOffline() {

    console.log(
        '💤 Verificando mensagens enviadas enquanto o bot estava offline...'
    );

    try {

        let totalMensagens = 0;
        let totalXP = 0;

        // Usa os grupos que o próprio bot já conhece
        const gruposConhecidos =
            [...participantesGrupos.keys()];

        console.log(
            `💤 Grupos conhecidos para XP: ${gruposConhecidos.length}`
        );

        for (
            const grupoId
            of gruposConhecidos
        ) {

            try {

                // ====================================================
                // PRIMEIRA VEZ VENDO ESTE GRUPO
                // ====================================================

                if (
                    !controleXP.has(
                        grupoId
                    )
                ) {

                    const agora =
                        Math.floor(
                            Date.now() / 1000
                        );

                    controleXP.set(
                        grupoId,
                        agora
                    );

                    console.log(
                        `💤 Primeiro registro de XP para ${grupoId}`
                    );

                    continue;
                }

                const ultimoTimestamp =
                    Number(
                        controleXP.get(
                            grupoId
                        )
                    ) || 0;

                // ====================================================
                // PEGAR MENSAGENS DIRETAMENTE DO WHATSAPP WEB
                // ====================================================

                const mensagens =
                    await obterMensagensGrupoDireto(
                        grupoId,
                        1000
                    );

                if (
                    !mensagens ||
                    mensagens.length === 0
                ) {

                    console.log(
                        `💤 Nenhuma mensagem disponível no grupo ${grupoId}.`
                    );

                    continue;
                }

                // ====================================================
                // FILTRAR MENSAGENS ENVIADAS DURANTE O OFFLINE
                // ====================================================

                const mensagensOffline =
                    mensagens.filter(
                        mensagem => {

                            const timestamp =
                                Number(
                                    mensagem.timestamp
                                ) || 0;

                            return (
                                timestamp >
                                ultimoTimestamp
                            );
                        }
                    );

                // ====================================================
                // DAR XP
                // ====================================================

                let quantidadeGrupo = 0;

                for (
                    const mensagem
                    of mensagensOffline
                ) {

                    // Ignorar mensagens do próprio bot
                    if (
                        mensagem.fromMe
                    ) {
                        continue;
                    }

                    // Ignorar notificações do sistema
                    if (
                        mensagem.type ===
                            'notification' ||
                        mensagem.isNotification
                    ) {
                        continue;
                    }

                    const idUsuario =
                        mensagem.author ||
                        mensagem.from;

                    if (
                        !idUsuario
                    ) {
                        continue;
                    }

                    adicionarXP(
                        grupoId,
                        idUsuario,
                        XP_POR_MENSAGEM
                    );

                    quantidadeGrupo++;

                    totalMensagens++;

                    totalXP +=
                        XP_POR_MENSAGEM;
                }

                // ====================================================
                // ATUALIZAR PONTO DE CONTROLE
                // ====================================================

                const agora =
                    Math.floor(
                        Date.now() / 1000
                    );

                controleXP.set(
                    grupoId,
                    agora
                );

                console.log(
                    `💤 ${grupoId}: ${quantidadeGrupo} mensagens recuperadas.`
                );

            } catch (erroGrupo) {

                console.error(
                    `⚠️ Erro ao processar XP do grupo ${grupoId}:`,
                    erroGrupo
                );
            }
        }

        // ========================================================
        // SALVAR TUDO
        // ========================================================

        salvarXP();
        salvarControleXP();

        console.log(
            `💤 XP OFFLINE CONCLUÍDO: ${totalMensagens} mensagens = +${totalXP} XP`
        );

    } catch (erro) {

        console.error(
            '❌ Erro geral ao processar XP offline:',
            erro
        );
    }
}


// ============================================================
// ⏱️ ATUALIZAR CONTROLE DO XP ENQUANTO O BOT ESTÁ ONLINE
// ============================================================

function atualizarControleXPOnline(
    message
) {

    try {

        if (
            !message ||
            !message.from ||
            !message.from.endsWith('@g.us')
        ) {
            return;
        }

        const timestamp =
            Number(
                message.timestamp
            ) ||
            Math.floor(
                Date.now() / 1000
            );

        controleXP.set(
            message.from,
            timestamp
        );

    } catch (erro) {

        console.error(
            '⚠️ Erro ao atualizar controle de XP online:',
            erro
        );
    }
}


// ============================================================
// 💾 SALVAR CONTROLE PERIODICAMENTE
// ============================================================

setInterval(
    () => {

        salvarControleXP();

    },
    60000
);

// ============================================================
// 😂 SALVAR PIADAS
// ============================================================

function salvarPiadas() {

    try {

        fs.writeFileSync(
            arquivoPiadas,
            JSON.stringify(
                piadas,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            '💾 Piadas salvas!'
        );

    } catch (erro) {

        console.log(
            '❌ Erro ao salvar piadas:',
            erro.message
        );
    }
}

// ============================================================
// CONEXÃO
// ============================================================

client.on('qr', qr => {
    console.log('\nEscaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on(
    'ready',
    async () => {

        console.log(
            '✅ BOT CONECTADO!'
        );

        await processarXPOffline();

        

    }
);

client.on('auth_failure', mensagem => {

    console.error(
        '❌ Falha na autenticação:',
        mensagem
    );

});


client.on('disconnected', motivo => {

    console.log(
        '⚠️ Bot desconectado:',
        motivo
    );

});


// ============================================================
// ID DA MENSAGEM
// ============================================================

function obterIdMensagem(message) {
    if (!message || !message.id) return null;

    if (message.id._serialized) {
        return message.id._serialized;
    }

    if (message.id.$1) {
        return message.id.$1;
    }

    if (
        message.id.fromMe !== undefined &&
        message.id.remote &&
        message.id.id
    ) {
        return `${message.id.fromMe}_${message.id.remote}_${message.id.id}`;
    }

    return null;
}


// ============================================================
// RESPOSTA CITADA
// ============================================================

async function responderCitando(message, conteudo, opcoes = {}) {
    try {
        const idMensagem = obterIdMensagem(message);

        const configuracao = {
            ...opcoes
        };

        if (idMensagem) {
            configuracao.quotedMessageId = idMensagem;
        }

        const conteudoFinal =
            aplicarPersonalidade(
                conteudo,
                message.from
            );

        return await enviarComMencoes(
            message.from,
            conteudoFinal,
            configuracao
        );

    } catch (erro) {
        console.error('❌ ERRO AO ENVIAR MENSAGEM:', erro);
        throw erro;
    }
}


// ============================================================
// REAÇÕES
// ============================================================

async function reagir(message, emoji) {
    try {
        await message.react(emoji);
    } catch (erro) {
        console.log(
            '⚠️ Não foi possível reagir:',
            erro.message
        );
    }
}


// ============================================================
// MENÇÕES
// ============================================================

async function obterPessoaMarcada(message) {
    try {
        const mencoes = await message.getMentions();
        if (mencoes && mencoes.length > 0) return mencoes[0];

        if (message.hasQuotedMsg) {
            try {
                const mensagemCitada = await message.getQuotedMessage();
                if (!mensagemCitada) return null;

                const idAutor = mensagemCitada.author || mensagemCitada.from || null;
                if (!idAutor || idAutor === message.from) return null;

                if (typeof mensagemCitada.getContact === 'function') {
                    try {
                        const contato = await mensagemCitada.getContact();
                        if (contato) return contato;
                    } catch (erroContato) {
                        console.log('⚠️ Não foi possível obter o contato da mensagem citada:', erroContato.message);
                    }
                }

                return { id: { _serialized: idAutor } };
            } catch (erroResposta) {
                console.log('⚠️ Erro ao obter pessoa pela resposta:', erroResposta.message);
            }
        }

        return null;
    } catch (erro) {
        console.log('⚠️ Erro ao obter menção/resposta:', erro.message);
        return null;
    }
}

function nomeDaPessoa(contato) {
    if (!contato) {
        return 'alguém';
    }

    return (
        contato.pushname ||
        contato.name ||
        contato.shortName ||
        contato.number ||
        'alguém'
    );
}

function obterIdDeMencao(idOuContato) {
    if (!idOuContato) {
        return null;
    }

    if (typeof idOuContato === 'object') {
        return (
            idOuContato.id?._serialized ||
            idOuContato.id?.$1 ||
            idOuContato._serialized ||
            null
        );
    }

    return String(idOuContato);
}

function mencaoDaPessoa(contato) {
    const id = obterIdDeMencao(contato);

    if (!id) {
        return '@alguém';
    }

    // IMPORTANTE: o texto precisa usar exatamente o mesmo identificador
    // que vai em `mentions`. Isso é especialmente importante para LIDs.
    return `@${id.split('@')[0]}`;
}

// ============================================================
// MENÇÕES
// ============================================================
// Mantemos exatamente o ID fornecido pelo WhatsApp.
// Não convertemos LID -> @c.us aqui: o PPP e os comandos de casamento
// que já funcionam usam o ID original do participante/contato, e o
// texto da menção usa o mesmo prefixo. Alterar esse ID no envio pode
// fazer o WhatsApp renderizar apenas um @123... sem transformar em menção.

async function prepararMencoesParaEnvio(texto, mentions) {
    if (!Array.isArray(mentions) || mentions.length === 0) {
        return { texto, mentions };
    }

    let textoFinal = texto;
    const mentionsFinais = [];

    for (const mention of mentions) {
        const id = obterIdDeMencao(mention);

        if (!id) {
            continue;
        }

        mentionsFinais.push(id);

        const prefixo = id.split('@')[0];

        if (prefixo) {
            // Garante que o @ exibido no texto corresponda ao ID real
            // que está sendo enviado na propriedade `mentions`.
            const variantes = [
                `@${prefixo}`
            ];

            if (typeof mention === 'object' && mention.number) {
                variantes.push(
                    `@${String(mention.number).replace(/\D/g, '')}`
                );
            }

            for (const variante of variantes) {
                if (textoFinal.includes(variante) && variante !== `@${prefixo}`) {
                    textoFinal = textoFinal.split(variante).join(`@${prefixo}`);
                }
            }
        }
    }

    return {
        texto: textoFinal,
        mentions: [...new Set(mentionsFinais)]
    };
}

async function enviarComMencoes(destino, conteudo, opcoes = {}) {
    const configuracao = { ...opcoes };

    const textoOriginal =
        typeof conteudo === 'string'
            ? conteudo
            : configuracao.caption;

    if (
        typeof textoOriginal === 'string' &&
        Array.isArray(configuracao.mentions) &&
        configuracao.mentions.length > 0
    ) {
        const preparado =
            await prepararMencoesParaEnvio(
                textoOriginal,
                configuracao.mentions
            );

        configuracao.mentions = preparado.mentions;

        if (typeof conteudo === 'string') {
            conteudo = preparado.texto;
        } else {
            configuracao.caption = preparado.texto;
        }
    }

    return await client.sendMessage(
        destino,
        conteudo,
        configuracao
    );
}

async function responderComMencoes(message, conteudo, chatIdOuOpcoes, opcoes = {}) {
    let chatId = chatIdOuOpcoes;
    let configuracao = opcoes;

    if (
        chatIdOuOpcoes &&
        typeof chatIdOuOpcoes === 'object' &&
        !Array.isArray(chatIdOuOpcoes)
    ) {
        chatId = message.from;
        configuracao = chatIdOuOpcoes;
    }

    return await enviarComMencoes(
        chatId || message.from,
        conteudo,
        {
            ...configuracao,
            quotedMessageId: obterIdMensagem(message)
        }
    );
}

// O ID usado pelos outros sistemas continua sendo o ID interno original.
// A conversão para menção real acontece somente no momento do envio.
function idDaPessoa(contato) {
    if (!contato || !contato.id) {
        return null;
    }

    if (contato.id._serialized) {
        return contato.id._serialized;
    }

    if (contato.id.$1) {
        return contato.id.$1;
    }

    return null;
}

async function exigirPessoa(message) {
    const pessoa = await obterPessoaMarcada(message);

    if (!pessoa) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *𝐌𝐄𝐍𝐂̧𝐀̃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀*
│
├➤ _Mencione alguém ou responda à mensagem dela._
│
├➤ *𝐄𝐗𝐄𝐌𝐏𝐋𝐎:*
│   *${PREFIXO}tapa @pessoa*
│
┗═•❃༺✿༻❃•═┛`
        );

        return null;
    }

    return pessoa;
}


// ============================================================
// PERMISSÕES DE ADMIN
// ============================================================

function obterIdRemetente(message) {
    if (!message) {
        return null;
    }

    return message.author || message.from || null;
}

// ============================================================
// COMPARAR IDs DO WHATSAPP
// ============================================================

function idsIguais(id1, id2) {
    if (!id1 || !id2) {
        return false;
    }

    const normalizar = id =>
        typeof id === 'object'
            ? (id._serialized || id.user || null)
            : id;

    const a = normalizar(id1);
    const b = normalizar(id2);

    if (!a || !b) {
        return false;
    }

    if (a === b) {
        return true;
    }

    const textoA = String(a);
    const textoB = String(b);
    const tipoA = textoA.includes('@') ? textoA.split('@')[1] : '';
    const tipoB = textoB.includes('@') ? textoB.split('@')[1] : '';

    // Nunca consideramos um LID igual a um telefone só porque
    // ambos têm números antes do @. LIDs e JIDs podem ter valores
    // numéricos completamente diferentes.
    const saoTelefones =
        (!tipoA || tipoA === 'c.us') &&
        (!tipoB || tipoB === 'c.us');

    if (!saoTelefones) {
        return false;
    }

    const numeroA = textoA.split('@')[0].replace(/\D/g, '');
    const numeroB = textoB.split('@')[0].replace(/\D/g, '');

    return Boolean(numeroA && numeroB && numeroA === numeroB);
}

function salvarParticipantesGrupos() {

    const dados = {};

    for (
        const [grupo, participantes]
        of participantesGrupos
    ) {

        dados[grupo] =
            [...participantes];
    }

    fs.writeFileSync(
        arquivoParticipantesGrupos,
        JSON.stringify(
            dados,
            null,
            4
        ),
        'utf8'
    );
}

// ============================================================
// OBTER IDS DA PESSOA
// ============================================================

async function obterIdsPessoa(contatoOuId) {

    const ids = new Set();

    if (!contatoOuId) {
        return ids;
    }

    if (typeof contatoOuId === 'object') {

        if (contatoOuId.id?._serialized) {
            ids.add(contatoOuId.id._serialized);
        }

        if (contatoOuId.id?.user) {
            ids.add(contatoOuId.id.user);
        }

        if (contatoOuId.number) {
            ids.add(`${contatoOuId.number}@c.us`);
        }

    } else {

        ids.add(String(contatoOuId));
    }

    const idsAtuais = [...ids];

    for (const id of idsAtuais) {

        try {

            if (id.endsWith('@c.us')) {

                const resultado =
                    await client.getContactLidAndPhone([
                        id
                    ]);

                if (
                    resultado &&
                    resultado.length > 0
                ) {

                    for (const contato of resultado) {

                        if (contato.lid) {
                            ids.add(contato.lid);
                        }

                        if (contato.pn) {
                            ids.add(contato.pn);
                        }
                    }
                }
            }

        } catch (erro) {

            console.log(
                '⚠️ Não foi possível obter LID:',
                erro.message
            );
        }
    }

    return ids;
}

// ============================================================
// VERIFICAR SE O BOT É ADMIN
// ============================================================
async function ehBotAdmin(chat) {
    try {
        if (!chat || !chat.isGroup) {
            return false;
        }

        const chatId =
            chat.id?._serialized ||
            chat.id?.toString?.() ||
            null;

        if (!chatId) {
            return false;
        }

        // ========================================================
        // OBTER IDS POSSÍVEIS DO BOT
        // ========================================================

        const botIds = new Set();

        // ID principal informado pelo WhatsApp Web
        const botIdPrincipal =
            client.info?.wid?._serialized ||
            client.info?.wid?.toString?.() ||
            null;

        if (botIdPrincipal) {
            botIds.add(botIdPrincipal);
        }

        // Tentar obter número/LID relacionados ao bot
        try {
            if (
                botIdPrincipal &&
                botIdPrincipal.endsWith('@c.us')
            ) {
                const resultado =
                    await client.getContactLidAndPhone([
                        botIdPrincipal
                    ]);

                if (
                    resultado &&
                    resultado.length > 0
                ) {
                    for (
                        const contato of resultado
                    ) {
                        if (contato.lid) {
                            botIds.add(
                                contato.lid
                            );
                        }

                        if (contato.pn) {
                            botIds.add(
                                contato.pn
                            );
                        }
                    }
                }
            }
        } catch (erroLid) {
            console.log(
                '⚠️ Não foi possível obter LID do bot:',
                erroLid?.message ||
                    erroLid
            );
        }

        // ========================================================
        // OBTER PARTICIPANTES DIRETAMENTE DO WHATSAPP WEB
        // ========================================================

        const participantes =
            await client.pupPage.evaluate(
                chatId => {
                    try {
                        const Store =
                            window.require(
                                'WAWebCollections'
                            );

                        if (
                            !Store ||
                            !Store.Chat
                        ) {
                            return {
                                sucesso: false,
                                erro:
                                    'Coleção Chat não disponível.'
                            };
                        }

                        const chatInterno =
                            Store.Chat.get(
                                chatId
                            );

                        if (!chatInterno) {
                            return {
                                sucesso: false,
                                erro:
                                    'Grupo não encontrado.'
                            };
                        }

                        const lista =
                            chatInterno
                                .groupMetadata
                                ?.participants;

                        if (!lista) {
                            return {
                                sucesso: false,
                                erro:
                                    'Participantes do grupo não disponíveis.'
                            };
                        }

                        let modelos = [];

                        if (
                            typeof lista.getModelsArray ===
                            'function'
                        ) {
                            modelos =
                                lista.getModelsArray();
                        } else if (
                            Array.isArray(
                                lista.models
                            )
                        ) {
                            modelos =
                                lista.models;
                        }

                        return {
                            sucesso: true,
                            participantes:
                                modelos.map(
                                    participante => ({
                                        id:
                                            participante
                                                .id
                                                ?._serialized ||
                                            participante
                                                .id
                                                ?.toString?.() ||
                                            null,

                                        isAdmin:
                                            !!participante
                                                .isAdmin,

                                        isSuperAdmin:
                                            !!participante
                                                .isSuperAdmin,

                                        isMe:
                                            !!participante
                                                .isMe
                                    })
                                )
                        };

                    } catch (erro) {
                        return {
                            sucesso: false,
                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )
                        };
                    }
                },
                chatId
            );

        if (
            !participantes ||
            !participantes.sucesso
        ) {
            console.log(
                '⚠️ Não foi possível obter participantes:',
                participantes?.erro ||
                    'erro desconhecido'
            );

            return false;
        }

        // ========================================================
        // ENCONTRAR O BOT
        // ========================================================

        const participanteBot =
            participantes.participantes.find(
                participante => {

                    // Melhor indicador:
                    // o próprio WhatsApp marcou este participante
                    // como sendo a conta atual.
                    if (
                        participante.isMe
                    ) {
                        return true;
                    }

                    // Fallback pelos IDs conhecidos.
                    for (
                        const botId of botIds
                    ) {
                        if (
                            idsIguais(
                                participante.id,
                                botId
                            )
                        ) {
                            return true;
                        }
                    }

                    return false;
                }
            );

        if (!participanteBot) {
            console.log(
                '⚠️ Bot não foi encontrado nos participantes do grupo.'
            );

            return false;
        }

        // ========================================================
        // VERIFICAR ADMIN
        // ========================================================

        const botAdmin =
            !!(
                participanteBot.isAdmin ||
                participanteBot.isSuperAdmin
            );

        console.log(
            '🤖 Bot encontrado:',
            participanteBot.id
        );

        console.log(
            '👑 Bot é admin:',
            botAdmin
        );

        return botAdmin;

    } catch (erro) {
        console.error(
            '❌ Erro ao verificar se o bot é admin:',
            erro
        );

        return false;
    }
}

// ============================================================
// VERIFICAR ADMIN DO USUÁRIO
// ============================================================

function ehAdminDoGrupo(message, chat) {

    try {

        if (!chat || !chat.isGroup) {
            return false;
        }

        const idRemetente =
            obterIdRemetente(message);



// ============================================================
// 👥 REGISTRAR PARTICIPANTE DO GRUPO
// ============================================================

console.log('👥 TESTE PARTICIPANTE');
console.log('📍 CHAT:', message.from);
console.log('👤 REMETENTE:', idRemetente);

if (
    message.from.endsWith('@g.us') &&
    idRemetente
) {

    if (
        !participantesGrupos.has(
            message.from
        )
    ) {

        participantesGrupos.set(
            message.from,
            new Set()
        );
    }

    const participantes =
        participantesGrupos.get(
            message.from
        );

    const tamanhoAntes =
        participantes.size;

    participantes.add(
        idRemetente
    );

    if (
        participantes.size >
        tamanhoAntes
    ) {

        salvarParticipantesGrupos();
    }
}

        if (!idRemetente) {
            return false;
        }

        const participante =
            chat.participants.find(
                participante =>
                    participante.id &&
                    idsIguais(
                        participante.id,
                        idRemetente
                    )
            );

        return !!(
            participante &&
            (
                participante.isAdmin ||
                participante.isSuperAdmin
            )
        );

    } catch (erro) {

        console.log(
            '⚠️ Erro ao verificar admin:',
            erro.message
        );

        return false;
    }
}



// ============================================================
// EXIGIR ADMIN
// ============================================================

console.log('🔥 EXIGIR ADMIN NOVA VERSÃO');

async function exigirAdmin(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE É GRUPO
        // ========================================================

        if (!chatId || !chatId.endsWith('@g.us')) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎*
│
├➤ _Esse comando só funciona em grupos._
│
┗═•❃༺✿༻❃•═┛`
            );

            return false;
        }

        // ========================================================
        // OBTER LID DO BOT
        // ========================================================

        const botNumero = '556182770049';

        let botIds = [];

        try {

            const resultadoLid =
                await client.getContactLidAndPhone([
                    `${botNumero}@c.us`
                ]);

            if (
                resultadoLid &&
                resultadoLid.length > 0
            ) {

                for (const contato of resultadoLid) {

                    if (contato.lid) {
                        botIds.push(contato.lid);
                    }

                    if (contato.pn) {
                        botIds.push(contato.pn);
                    }
                }
            }

        } catch (erroLid) {

            console.log(
                '⚠️ Erro ao obter LID do bot:',
                erroLid?.message || erroLid
            );
        }

        // Garantir número normal
        if (!botIds.includes(`${botNumero}@c.us`)) {

            botIds.push(
                `${botNumero}@c.us`
            );
        }

        console.log(
            '🔥 IDS DO BOT OBTIDOS:',
            JSON.stringify(
                botIds,
                null,
                2
            )
        );

        // ========================================================
        // OBTER DADOS DO GRUPO
        // ========================================================

        const dadosChat =
            await client.pupPage.evaluate(
                (chatId, botIds) => {

                    try {

                        const Store =
                            window.require(
                                'WAWebCollections'
                            );

                        if (
                            !Store ||
                            !Store.Chat
                        ) {
                            return null;
                        }

                        const chat =
                            Store.Chat.get(chatId);

                        if (!chat) {
                            return null;
                        }

                        const participantes =
                            chat.groupMetadata?.participants;

                        if (!participantes) {
                            return null;
                        }

                        let modelos = [];

                        if (
                            typeof participantes.getModelsArray ===
                            'function'
                        ) {

                            modelos =
                                participantes.getModelsArray();

                        } else if (
                            Array.isArray(
                                participantes.models
                            )
                        ) {

                            modelos =
                                participantes.models;
                        }

                        return {

                            botIds,

                            participants:
                                modelos.map(
                                    participante => ({

                                        id:
                                            participante.id?._serialized ||
                                            participante.id?.toString?.() ||
                                            null,

                                        isAdmin:
                                            !!participante.isAdmin,

                                        isSuperAdmin:
                                            !!participante.isSuperAdmin,

                                        isMe:
                                            !!participante.isMe

                                    })
                                )

                        };

                    } catch (erro) {

                        return {

                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )

                        };
                    }

                },
                chatId,
                botIds
            );

        // ========================================================
        // ERRO AO OBTER GRUPO
        // ========================================================

        if (
            !dadosChat ||
            dadosChat.erro
        ) {

            console.error(
                '❌ Erro ao obter dados do grupo:',
                dadosChat?.erro
            );

            await reagir(message, '❌');

            await responderCitando(
                message,
                '❌ _Não foi possível verificar as permissões do grupo._'
            );

            return false;
        }

        // ========================================================
        // VERIFICAR ADMIN DO USUÁRIO
        // ========================================================

        const idRemetente =
            obterIdRemetente(message);

        console.log(
            '========== DEBUG ADMIN =========='
        );

        console.log(
            'REMETENTE:',
            idRemetente
        );

        console.log(
            'PARTICIPANTES:',
            JSON.stringify(
                dadosChat.participants,
                null,
                2
            )
        );

        console.log(
            '================================='
        );

        const participanteUsuario =
            dadosChat.participants.find(
                participante =>
                    idsIguais(
                        participante.id,
                        idRemetente
                    )
            );

        const usuarioAdmin =
            !!(
                participanteUsuario &&
                (
                    participanteUsuario.isAdmin ||
                    participanteUsuario.isSuperAdmin
                )
            );

        // ========================================================
        // USUÁRIO NÃO É ADMIN
        // ========================================================

        if (!usuarioAdmin) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎*
│
├➤ _Você precisa ser administrador_
│   _para usar esse comando._
│
┗═•❃༺✿༻❃•═┓`
            );

            return false;
        }

        // ========================================================
        // VERIFICAR SE O BOT É ADMIN
        // ========================================================

        console.log(
            '========== DEBUG BOT =========='
        );

        console.log(
            'IDS DO BOT:',
            JSON.stringify(
                dadosChat.botIds,
                null,
                2
            )
        );

        console.log(
            '================================'
        );

        const participanteBot =
            dadosChat.participants.find(
                participante =>
                    dadosChat.botIds.some(
                        botId =>
                            idsIguais(
                                participante.id,
                                botId
                            )
                    )
            );

        const botAdmin =
            !!(
                participanteBot &&
                (
                    participanteBot.isAdmin ||
                    participanteBot.isSuperAdmin
                )
            );

        console.log(
            'PARTICIPANTE BOT:',
            JSON.stringify(
                participanteBot,
                null,
                2
            )
        );

        console.log(
            'BOT É ADMIN:',
            botAdmin
        );

        // ========================================================
        // BOT NÃO É ADMIN
        // ========================================================

        if (!botAdmin) {

            console.log(
                '⚠️ Bot não encontrado como administrador.'
            );

            await reagir(message, '⚠️');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐁𝐎𝐓 NÃO É ADMIN*
│
├➤ _Eu preciso ser administrador_
│   _do grupo para fazer isso._
│
├➤ _Promova o JUST BOT e tente novamente._
│
┗═•❃༺✿༻❃•═┛`
            );

            return false;
        }

        // ========================================================
        // TUDO CERTO
        // ========================================================

        console.log(
            '✅ USUÁRIO E BOT SÃO ADMINISTRADORES!'
        );

        return true;

    } catch (erro) {

        console.error(
            '❌ Erro ao verificar permissões:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            '❌ _Não foi possível verificar as permissões do grupo._'
        );

        return false;
    }
}

// ============================================================
// 🏠 MENU PRINCIPAL
// ============================================================

async function menuPrincipal(message) {

    await reagir(
        message,
        '📋'
    );

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│     *𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
│       *𝐕${VERSAO}*
├✯
│
│  💘 *𝐑𝐄𝐋𝐀𝐂𝐈𝐎𝐍𝐀𝐌𝐄𝐍𝐓𝐎𝐒*
│  _Casamentos, família e romance_
│
│  😂 *𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎*
│  _Piadas e diversão_
│
│  🎮 *𝐉𝐎𝐆𝐎𝐒*
│  _Jogos e desafios_
│
│  ⚔️ *𝐑𝐏𝐆*
│  _Ações, combate e aventura_
│
│  🖼️ *𝐌𝐈́𝐃𝐈𝐀*
│  _Figurinhas, emojis e música_
│
│  🛡️ *𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎*
│  _Ferramentas para administradores_
│
│  🌐 *𝐀𝐏𝐈𝐒*
│  _Serviços e informações online_
│
│  ⚙️ *𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒*
│  _Ferramentas gerais_
│
│  🤖 *𝐁𝐎𝐓*
│  _Informações e comandos do bot_
│
├✯
│
│  💡 *𝐂𝐎𝐌𝐎 𝐔𝐒𝐀𝐑*
│  _Digite o comando da categoria_
│  _para abrir seu menu._
│
┗═•❃༺✿༻❃•═┛

*𝐄𝐗𝐄𝐌𝐏𝐋𝐎:*
*${PREFIXO}jogos* 🎮

*𝐕𝐄𝐑𝐒𝐀̃𝐎 ${VERSAO}*`
    );
}

// ============================================================
// 📂 MENUS DE CATEGORIAS
// ============================================================

// ============================================================
// 💘 MENU RELACIONAMENTOS
// ============================================================

async function menuRelacionamentos(message) {

    await reagir(
        message,
        '💘'
    );

    await responderCitando(
        message,
        `┏═•❃༺💘༻❃•═┓
│  *💘 𝐑𝐄𝐋𝐀𝐂𝐈𝐎𝐍𝐀𝐌𝐄𝐍𝐓𝐎𝐒*
├✯
│
├➤ 💍 *${PREFIXO}casar @pessoa*
│   _Fazer uma proposta de casamento_
│
├➤ 💔 *${PREFIXO}divorcio*
│   _Solicitar um divórcio_
│
├➤ 👶 *${PREFIXO}adotar @pessoa*
│   _Fazer uma proposta de adoção_
│
├➤ 👨‍👩‍👧 *${PREFIXO}familia*
│   _Ver sua família_
│
├➤ 💞 *${PREFIXO}casal*
│   _Formar um casal aleatório_
│
├➤ 💘 *${PREFIXO}shipar @pessoa @pessoa*
│   _Calcular compatibilidade_
│
├➤ 😏 *${PREFIXO}cantada*
│   _Receber uma cantada_
│
├✯
│
│  📩 *𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀𝐒*
│
├➤ 💍 *${PREFIXO}aceitar*
│   _Aceitar uma proposta_
│
├➤ 💔 *${PREFIXO}recusar*
│   _Recusar uma proposta_
│
┗═•❃༺💘༻❃•═┛`
    );
}


// ============================================================
// 😂 MENU DIVERSÃO
// ============================================================

async function menuDiversao(message) {

    await reagir(
        message,
        '😂'
    );

    await responderCitando(
        message,
        `┏═•❃༺😂༻❃•═┓
│
│      *𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎*
│
├✯
│
│  😂 *𝐏𝐈𝐀𝐃𝐀𝐒*
│
│  *${PREFIXO}piadas*
│  _Receba uma piada aleatória._
│
│  *${PREFIXO}addpiada*
│  _Adicione uma piada personalizada._
│
│  *${PREFIXO}listapiadas*
│  _Veja todas as piadas cadastradas._
│
│  *${PREFIXO}removerpiada*
│  _Remova uma piada pelo número._
│
│  *${PREFIXO}limparpiadas*
│  _Apague todas as piadas._
│
│  *${PREFIXO}carregarpiadas*
│  _Importe piadas através de um .txt._
│
├✯
│  🌐 *𝐀𝐏𝐈𝐒*
│
│  *${PREFIXO}piada*
│  _Buscar uma piada em API pública._
│
│  *${PREFIXO}anime <nome>*
│  _Consultar informações de um anime._
│
├✯
│  💘 *𝐑𝐎𝐌𝐀𝐍𝐂𝐄*
│
│  *${PREFIXO}cantada*
│  _Receba uma cantada aleatória._
│
│  ☠️ *${PREFIXO}suicidio*
│  _Comando de humor do bot._
│
├✯
│
│  💡 Para voltar ao menu:
│  *${PREFIXO}menu*
│
┗═•❃༺😂༻❃•═┛`
    );
}


// ============================================================
// ⚔️ MENU RPG
// ============================================================

async function menuRPG(message) {

    await reagir(
        message,
        '⚔️'
    );

    await responderCitando(
        message,
        `┏═•❃༺⚔️༻❃•═┓
│        *⚔️ 𝐑𝐏𝐆*
├✯
│
│  ⚔️ *𝐂𝐎𝐌𝐁𝐀𝐓𝐄*
│
├➤ 👋 *${PREFIXO}tapa @pessoa*
├➤ 👊 *${PREFIXO}soco @pessoa*
├➤ 🦵 *${PREFIXO}chute @pessoa*
├➤ 💨 *${PREFIXO}empurrar @pessoa*
├➤ ⚔️ *${PREFIXO}duelo @pessoa*
├➤ 💰 *${PREFIXO}roubar @pessoa*
│
├✯
│
│  ❤️ *𝐈𝐍𝐓𝐄𝐑𝐀𝐂̧𝐎̃𝐄𝐒*
│
├➤ 🤗 *${PREFIXO}abracar @pessoa*
├➤ 🛡️ *${PREFIXO}proteger @pessoa*
├➤ 💚 *${PREFIXO}curar @pessoa*
├➤ ⭐ *${PREFIXO}elogiar @pessoa*
├➤ 😂 *${PREFIXO}zoar @pessoa*
│
├✯
│
│  🗺️ *𝐀𝐕𝐄𝐍𝐓𝐔𝐑𝐀*
│
├➤ 🗺️ *${PREFIXO}aventura*
│   _Parta para uma aventura_
│
┗═•❃༺⚔️༻❃•═┛

_⚠️ Todas as ações são fictícias._`
    );
}


// ============================================================
// 🖼️ MENU MÍDIA
// ============================================================

async function menuMidia(message) {

    await reagir(
        message,
        '🖼️'
    );

    await responderCitando(
        message,
        `┏═•❃༺🖼️༻❃•═┓
│       *🖼️ 𝐌𝐈́𝐃𝐈𝐀*
├✯
│
├➤ 🖼️ *${PREFIXO}fig*
│   _Transformar imagem em figurinha_
│
├➤ 🖼️ *${PREFIXO}figurinha*
│   _Criar uma figurinha_
│
├➤ 😀 *${PREFIXO}emojimix 😀 😂*
│   _Combinar dois emojis_
│
├➤ 🖤 *${PREFIXO}brat1 texto*
│   _Criar figurinha Brat_
│
├➤ 🖤 *${PREFIXO}brat2 texto*
│   _Criar Brat animado_
│
├➤ 🎵 *${PREFIXO}playm música*
│   _Buscar música e prévia_
│
├➤ 🗣️ *${PREFIXO}tts texto*
│   _Transformar texto em voz do Google_
│
├➤ 🎙️ *${PREFIXO}esquilo* / *${PREFIXO}robo*
│   _Modificar um áudio com efeitos de voz_
│
├➤ 👹 *${PREFIXO}demonio* / *${PREFIXO}grave*
│   _Vozes graves e sobrenaturais_
│
├➤ 📻 *${PREFIXO}radio* / *${PREFIXO}telefone*
│   _Efeitos de rádio e telefone_
│
├➤ 🏔️ *${PREFIXO}eco* / *${PREFIXO}cavern*
│   _Eco e caverna_
│
├✯
│
│  👁️ _Algumas mídias podem ser_
│  _enviadas como visualização única._
│
┗═•❃༺🖼️༻❃•═┛`
    );
}


// ============================================================
// 🛡️ MENU MODERAÇÃO
// ============================================================

async function menuModeracao(message) {

    await reagir(
        message,
        '🛡️'
    );

    await responderCitando(
        message,
        `┏═•❃༺🛡️༻❃•═┓
│    *🛡️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎*
├✯
│
├➤ 🔨 *${PREFIXO}ban @pessoa*
│   _Expulsar uma pessoa_
│   _Também funciona respondendo à mensagem_
│
├➤ 🔇 *${PREFIXO}mute @pessoa*
│   _Silenciar uma pessoa_
│
├➤ 🔓 *${PREFIXO}unmute @pessoa*
│   _Remover o mute_
│
├➤ 🚫 *${PREFIXO}muteblacklist número*
│   _Adicionar à blacklist_
│
├➤ ✅ *${PREFIXO}unmuteblacklist número*
│   _Remover da blacklist_
│
│ 🔔 *AVISOS AUTOMÁTICOS*
│
│ 🔔 ;aviso HH:MM / mensagem
│    Cria um aviso diário.
│
│ 🗑️ ;rem_aviso HH:MM
│    Remove um aviso.
│
│ 📋 ;listaviso
│    Lista os avisos do grupo.
│
├➤ 🔒 *${PREFIXO}soadm*
│   _Alternar modo somente administradores_
│
├✯
│
│  👑 _O bot precisa ser_
│  _administrador do grupo._
│
┗═•❃༺🛡️༻❃•═┛`
    );
}


// ============================================================
// 🌐 MENU APIS
// ============================================================

async function menuAPIs(message) {
    await reagir(message, '🌐');
    await responderCitando(message, `┏═•❃༺🌐༻❃•═┓\n│        *🌐 𝐀𝐏𝐈𝐒*\n├✯\n│\n├➤ 🎵 *${PREFIXO}shazam*\n│   _Identificar uma música a partir de um áudio._\n│\n├➤ 📱 *${PREFIXO}qr <texto/link>*\n│   _Gerar um QR Code._\n│\n├➤ ⚽ *${PREFIXO}futebol*\n│   _Ver jogos de futebol de hoje._\n│\n├➤ 🔴 *${PREFIXO}futebol ao vivo*\n│   _Ver partidas ao vivo._\n│\n├➤ 🏎️ *${PREFIXO}f1*\n│   _Ver a próxima corrida._\n│\n├➤ 📅 *${PREFIXO}f1 calendario*\n│   _Ver o calendário da temporada._\n│\n├➤ 🏆 *${PREFIXO}f1 classificacao*\n│   _Ver a classificação de pilotos._\n│\n├➤ 🌫️ *${PREFIXO}ar <cidade>*\n│   _Consultar a qualidade do ar._\n│\n┗═•❃༺🌐༻❃•═┛`);
}

// ============================================================
// ⚙️ MENU UTILIDADES
// ============================================================

async function menuUtil(message) {

    await reagir(
        message,
        '⚙️'
    );

    await responderCitando(
        message,
        `┏═•❃༺⚙️༻❃•═┓
│     *⚙️ 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒*
├✯
│
├➤ 🏓 *${PREFIXO}ping*
│   _Verificar se o bot está online_
│
├➤ 🕐 *${PREFIXO}hora*
│   _Mostrar a hora atual_
│
├➤ 👤 *${PREFIXO}info*
│   _Mostrar informações_
│
├➤ 🌦️ *${PREFIXO}clima <cidade>*
│   _Consultar o clima atual_
│
┗═•❃༺⚙️༻❃•═┛`
    );
}


// ============================================================
// 🤖 MENU DO BOT
// ============================================================

async function menuBot(message) {

    await reagir(
        message,
        '🤖'
    );

    await responderCitando(
        message,
        `┏═•❃༺🤖༻❃•═┓
│       *🤖 𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
├✯
│
├➤ 📋 *${PREFIXO}menu*
│   _Abrir o menu principal_
│
├➤ 📜 *${PREFIXO}comandos*
│   _Ver todos os comandos_
│
├➤ 📝 *${PREFIXO}changelog*
│   _Ver novidades e alterações_
│
├➤ ℹ️ *${PREFIXO}sobre*
│   _Informações sobre o bot_
│
├➤ 🏓 *${PREFIXO}ping*
│   _Verificar status_
│
├➤ ⚙️ *${PREFIXO}info*
│   _Informações do sistema_
│
├➤ 🎭 *${PREFIXO}personalidades*
│   _Ver as personalidades disponíveis_
│
├➤ ⚙️ *${PREFIXO}personalidade <nome>*
│   _Alterar a personalidade do grupo_
│
├✯
│
│  🤖 *𝐒𝐓𝐀𝐓𝐔𝐒*
│
├➤ 🟢 _Online_
├➤ 🔢 _Versão ${VERSAO}_
│
┗═•❃༺🤖༻❃•═┛`
    );
}

// ============================================================
// 📜 CHANGELOG
// ============================================================

async function changelog(message) {

    await reagir(
        message,
        '📜'
    );

    await responderCitando(
        message,
        `┏═•❃༺📜༻❃•═┓
│
│        *𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
│       *𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆*
│
├✯
│
│  🆕 *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝟑.𝟏𝟕*
│
│  🌐 *𝐈𝐍𝐓𝐄𝐆𝐑𝐀𝐂̧𝐀̃𝐎 𝐂𝐎𝐌 𝐀𝐏𝐈𝐒*
│
│  ├➤ *${PREFIXO}pokemon <nome>*
│  │   Consulta dados de Pokémon.
│  │
│  ├➤ *${PREFIXO}piada*
│  │   Busca uma piada em API pública.
│  │
│  ├➤ *${PREFIXO}anime <nome>*
│  │   Consulta informações de anime.
│  │
│  ├➤ *${PREFIXO}quiz*
│  │   Agora usa perguntas aleatórias da Open Trivia DB.
│  │
│  └➤ *${PREFIXO}clima <cidade>*
│      Consulta o clima atual.
│
│  🌐 *𝐍𝐎𝐕𝐀𝐒 𝐀𝐏𝐈𝐒*
│
│  ├➤ *${PREFIXO}shazam*
│  │   Identifica músicas enviadas como áudio.
│  │
│  ├➤ *${PREFIXO}qr <texto/link>*
│  │   Gera QR Codes.
│  │
│  ├➤ *${PREFIXO}futebol*
│  │   Consulta jogos de futebol.
│  │
│  ├➤ *${PREFIXO}f1*
│  │   Consulta calendário e classificação da F1.
│  │
│  └➤ *${PREFIXO}ar <cidade>*
│      Consulta a qualidade do ar.
│
│  🔒 *𝐌𝐎𝐃𝐎 𝐒𝐎𝐌𝐄𝐍𝐓𝐄 𝐀𝐃𝐌*
│
│  ├➤ *${PREFIXO}soadm*
│  │   Alterna o grupo entre modo normal
│  │   e modo em que apenas administradores
│  │   podem usar os comandos.
│  │
│  🛡️ *𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎 E ALVOS POR RESPOSTA*
│
│  ├➤ *${PREFIXO}ban @pessoa*
│  │   Expulsa participantes do grupo.
│  │
│  ├➤ *${PREFIXO}ban* em resposta
│  │   Identifica o alvo pela mensagem respondida.
│  │
│  └➤ Comandos de alvo agora aceitam resposta
│      além de menções quando aplicável.
│
│  💰 *𝐁𝐋𝐈𝐍𝐃𝐀𝐆𝐄𝐌 𝐃𝐀 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀*
│
│  ├➤ Identidade LID/JID e carteiras reforçadas.
│  ├➤ Cooldowns de mineração e roubo persistem após reinício.
│  ├➤ Apostas, doações e sorteios recebem validação rígida.
│  ├➤ Histórico dos slots ficou mais completo.
│  └➤ Rankings não criam carteiras novas.
│
│  😂 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐏𝐈𝐀𝐃𝐀𝐒*
│
│  ├➤ *${PREFIXO}addpiada*
│  │   Adiciona piadas personalizadas.
│  │
│  ├➤ *${PREFIXO}listapiadas*
│  │   Lista todas as piadas cadastradas.
│  │
│  ├➤ *${PREFIXO}removerpiada*
│  │   Remove uma piada pelo número.
│  │
│  ├➤ *${PREFIXO}limparpiadas*
│  │   Remove todas as piadas com confirmação.
│  │
│  └➤ *${PREFIXO}carregarpiadas*
│      Importa várias piadas através
│      de um arquivo *.txt*.
│
│  💾 As piadas agora são salvas
│     automaticamente e permanecem
│     após reiniciar o bot.
│
├✯
│
│  📋 *𝐌𝐄𝐍𝐔 𝐑𝐄𝐃𝐄𝐒𝐄𝐍𝐇𝐀𝐃𝐎*
│
│  O sistema de menus foi reorganizado
│  em categorias para facilitar o uso.
│
├✯
│
│  🔙 *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝟑.𝟖*
│
│  ├➤ Novo sistema de menus
│  ├➤ Menus separados por categoria
│  └➤ Novo menu principal
│
│  🔙 *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝟑.𝟕*
│
│  ├➤ Sistema de relacionamentos
│  ├➤ Casamentos e divórcios
│  ├➤ Sistema de família
│  ├➤ Adoção
│  └➤ Diversos comandos novos
│
│  🔙 *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝟑.𝟓*
│
│  └➤ Atualização do sistema
│      de figurinhas Brat
│
┗═•❃༺📜༻❃•═┛

*𝐕𝐄𝐑𝐒𝐀̃𝐎 𝐀𝐓𝐔𝐀𝐋: 𝟑.𝟏𝟓*`
    );
}

// ============================================================
// 📋 LISTA COMPLETA DE COMANDOS
// ============================================================

async function listarComandos(message) {

    await reagir(
        message,
        '📋'
    );

    await responderCitando(
        message,
        `┏═•❃༺📋༻❃•═┓
│
│       *𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
│   *𝐋𝐈𝐒𝐓𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀*
│
├✯
│
│  💘 *𝐑𝐄𝐋𝐀𝐂𝐈𝐎𝐍𝐀𝐌𝐄𝐍𝐓𝐎𝐒*
│
├➤ 💍 *${PREFIXO}casar @pessoa*
│   _Fazer uma proposta de casamento_
│
├➤ 💍 *${PREFIXO}aceitar*
│   _Aceitar uma proposta_
│
├➤ 💔 *${PREFIXO}recusar*
│   _Recusar uma proposta_
│
├➤ 💔 *${PREFIXO}divorcio*
│   _Solicitar divórcio_
│
├➤ 👶 *${PREFIXO}adotar @pessoa*
│   _Propor uma adoção_
│
├➤ 👨‍👩‍👧 *${PREFIXO}familia*
│   _Ver sua família_
│
├➤ 💞 *${PREFIXO}casal*
│   _Formar um casal aleatório_
│
├➤ 💘 *${PREFIXO}shipar @pessoa @pessoa*
│   _Calcular compatibilidade_
│
├✯
│
│  😂 *𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎*
│
├➤ 😂 *${PREFIXO}piadas*
│   _Receber uma piada_
│
├➤ ➕ *${PREFIXO}addpiada texto*
│   _Adicionar uma piada_
│
├➤ 📋 *${PREFIXO}listapiadas*
│   _Listar as piadas_
│
├➤ 🗑️ *${PREFIXO}removerpiada número*
│   _Remover uma piada_
│
├➤ 🧹 *${PREFIXO}limparpiadas*
│   _Limpar todas as piadas_
│
├➤ 🔄 *${PREFIXO}carregarpiadas*
│   _Recarregar as piadas_
│
├➤ 😏 *${PREFIXO}cantada*
│   _Receber uma cantada_
│
├➤ 😂 *${PREFIXO}piada*
│   _Buscar uma piada em API pública_
│
├➤ 🍥 *${PREFIXO}anime <nome>*
│   _Consultar informações de um anime_
│
├➤ 🎵 *${PREFIXO}shazam*
│   _Identificar uma música a partir de um áudio_
│
├➤ 📱 *${PREFIXO}qr <texto/link>*
│   _Gerar um QR Code_
│
├➤ ⚽ *${PREFIXO}futebol*
│   _Ver jogos de futebol de hoje_
│
├➤ 🏎️ *${PREFIXO}f1*
│   _Ver a próxima corrida de F1_
│
├➤ 🌫️ *${PREFIXO}ar <cidade>*
│   _Consultar a qualidade do ar_
│
├➤ ☠️ *${PREFIXO}suicidio*
│   _Comando de humor_
│
├✯
│
│  🎮 *𝐉𝐎𝐆𝐎𝐒*
│
├➤ 🎲 *${PREFIXO}dado*
│   _Rolar um dado_
│
├➤ 🪙 *${PREFIXO}moeda*
│   _Cara ou coroa_
│
├➤ 🔮 *${PREFIXO}sn pergunta*
│   _Responder sim ou não_
│
├➤ ✂️ *${PREFIXO}ppt escolha*
│   _Pedra, papel ou tesoura_
│
├➤ 🔢 *${PREFIXO}adivinha*
│   _Adivinhar um número_
│
├➤ 🎯 *${PREFIXO}chute número*
│   _Dar um chute na adivinhação_
│
├➤ 🎯 *${PREFIXO}chuterpg @pessoa*
│   _Desafiar alguém_
│
├➤ 🧠 *${PREFIXO}quiz*
│   _Iniciar um quiz_
│
├➤ 🧠 *${PREFIXO}quiz resposta*
│   _Responder o quiz_
│
├➤ ⚡ *${PREFIXO}pokemon <nome>*
│   _Consultar um Pokémon_
│
├➤ ❤️ *${PREFIXO}ppp*
│   _Pega,pensa ou passa?_
│
├✯
│
│  💰 *𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀*
│
├➤ ⛏️ *${PREFIXO}minerar*
│   _Minerar e ganhar moedas_
│
├➤ 🥷 *${PREFIXO}roubar @pessoa*
│   _Tentar roubar alguém_
│
├➤ 🎰 *${PREFIXO}slots 100*
│   _Apostar moedas_
│
├➤ 💰 *${PREFIXO}saldo*
│   _Ver seu saldo_
│
├➤ 🏪 *${PREFIXO}loja*
│   _Ver a loja_
│
├➤ 🛒 *${PREFIXO}comprar <item>*
│   _Comprar um item_
│
├➤ 🎒 *${PREFIXO}inventario*
│   _Ver seus itens_
│
├➤ 💸 *${PREFIXO}doar 500 @pessoa*
│   _Doar moedas_
│
├➤ 🏆 *${PREFIXO}rankingdinheiro*
│   _Ranking dos mais ricos_
│
├➤ 🎉 *${PREFIXO}sortearm 500*
│   _Sortear moedas (admins)_
│
├✯
│
│  ⚔️ *𝐑𝐏𝐆*
│
├➤ 👋 *${PREFIXO}tapa @pessoa*
│   _Dar um tapa_
│
├➤ 👊 *${PREFIXO}soco @pessoa*
│   _Dar um soco_
│
├➤ 🫷 *${PREFIXO}empurrar @pessoa*
│   _Empurrar alguém_
│
├➤ 🤗 *${PREFIXO}abracar @pessoa*
│   _Abraçar alguém_
│
├➤ 🛡️ *${PREFIXO}proteger @pessoa*
│   _Proteger alguém_
│
├➤ ❤️ *${PREFIXO}curar @pessoa*
│   _Curar alguém_
│
├➤ 👏 *${PREFIXO}elogiar @pessoa*
│   _Elogiar alguém_
│
├➤ 😂 *${PREFIXO}zoar @pessoa*
│   _Zoar alguém_
│
├➤ ⚔️ *${PREFIXO}duelo @pessoa*
│   _Iniciar um duelo_
│
├➤ 🥷 *${PREFIXO}roubar @pessoa*
│   _Tentar roubar alguém_
│
├➤ 🗺️ *${PREFIXO}aventura*
│   _Iniciar uma aventura_
│
├✯
│
│  🛡️ *𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎*
│
├➤ 🔇 *${PREFIXO}mute @pessoa*
│   _Mutar alguém_
│
├➤ 🔊 *${PREFIXO}unmute @pessoa*
│   _Desmutar alguém_
│
├➤ 🚫 *${PREFIXO}muteblacklist @pessoa*
│   _Adicionar à blacklist de mute_
│
├➤ ✅ *${PREFIXO}unmuteblacklist @pessoa*
│   _Remover da blacklist de mute_
│ 🔔 *;aviso HH:MM / mensagem*
│    Cria um aviso diário
│
│ 🗑️ *;rem_aviso HH:MM*
│    Remove um aviso
│
│ 📋 *;listaviso*
│    Lista os avisos do grupo
│
├✯
│
│  ⚙️ *𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒*
│
├➤ 🏓 *${PREFIXO}ping*
│   _Verificar o tempo de resposta_
│
├➤ 🕐 *${PREFIXO}hora*
│   _Mostrar a hora_
│
├➤ ℹ️ *${PREFIXO}info*
│   _Mostrar informações_
│
├➤ 😴 *${PREFIXO}afk motivo*
│   _Ativar modo AFK_
│
├➤ 🎯 *${PREFIXO}ttg*
│   _Comando TTG_
│
├✯
│
│  🖼️ *𝐌𝐈́𝐃𝐈𝐀*
│
├➤ 🖼️ *${PREFIXO}fig*
│   _Criar figurinha_
│
├➤ 🖼️ *${PREFIXO}figurinha*
│   _Criar figurinha_
│
├➤ 🧩 *${PREFIXO}emojimix emoji emoji*
│   _Combinar emojis_
│
├➤ 📝 *${PREFIXO}brat1 texto*
│   _Gerar imagem Brat 1_
│
├➤ 📝 *${PREFIXO}brat2 texto*
│   _Gerar imagem Brat 2_
│
├➤ 🎵 *${PREFIXO}playm música*
│   _Tocar música_
│
├✯
│
│  📋 *𝐌𝐄𝐍𝐔𝐒*
│
├➤ 🔒 *${PREFIXO}soadm*
│   _Alternar modo somente administradores_
│
├➤ 📋 *${PREFIXO}menu*
│   _Menu principal_
│
├➤ 💘 *${PREFIXO}relacionamentos*
│   _Menu de relacionamentos_
│
├➤ 😂 *${PREFIXO}diversao*
│   _Menu de diversão_
│
├➤ 🎮 *${PREFIXO}jogos*
│   _Menu de jogos_
│
├➤ ⚔️ *${PREFIXO}rpg*
│   _Menu RPG_
│
├➤ 🖼️ *${PREFIXO}midia*
│   _Menu de mídia_
│
├➤ 🛡️ *${PREFIXO}moderacao*
│   _Menu de moderação_
│
├➤ 🌐 *${PREFIXO}apis*
│   _Menu de APIs_
│
├➤ ⚙️ *${PREFIXO}utilidades*
│   _Menu de utilidades_
│
├➤ 🤖 *${PREFIXO}bot*
│   _Menu do bot_
│
├✯
│
│  🎭 *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄*\n│\n├➤ 🎭 *${PREFIXO}personalidades*\n│   _Ver personalidades disponíveis_\n│\n├➤ ⚙️ *${PREFIXO}personalidade <nome>*\n│   _Alterar a personalidade do grupo_\n│\n├✯\n│\n│  🤖 *𝐁𝐎𝐓*
│
├➤ 📋 *${PREFIXO}comandos*
│   _Lista completa de comandos_
│
├➤ 📜 *${PREFIXO}changelog*
│   _Ver alterações do bot_
│
├➤ ℹ️ *${PREFIXO}sobre*
│   _Informações sobre o JUST BOT_
│
├✯
│
│  💡 *𝐃𝐈𝐂𝐀*
│
│  Use *${PREFIXO}menu* para acessar
│  os menus separados por categoria.
│
┗═•❃༺📋༻❃•═┛

*𝐕𝐄𝐑𝐒𝐀̃𝐎 ${VERSAO}*`
    );
}



// ============================================================
// DADO
// ============================================================

async function jogarDado(message) {
    const resultado =
        Math.floor(Math.random() * 6) + 1;

    await reagir(message, '🎲');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
├✯ *🎲 𝐃𝐀𝐃𝐎*
│
├➤ _Você tirou:_
│
│       *🎲 ${resultado}*
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MOEDA
// ============================================================

async function jogarMoeda(message) {
    const resultado =
        Math.random() < 0.5
            ? '𝐂𝐀𝐑𝐀'
            : '𝐂𝐎𝐑𝐎𝐀';

    await reagir(message, '🪙');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
├✯ *🪙 𝐌𝐎𝐄𝐃𝐀*
│
├➤ _Resultado:_
│
│       *${resultado}*
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// SIM OU NÃO
// ============================================================

async function jogarSN(message, pergunta) {
    if (!pergunta || !pergunta.trim()) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐏𝐄𝐑𝐆𝐔𝐍𝐓𝐀 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀*

_Exemplo:_
*${PREFIXO}sn eu vou conseguir?*`
        );

        return;
    }

    const resultado =
        Math.random() < 0.5
            ? '𝐒𝐈𝐌'
            : '𝐍𝐀̃𝐎';

    await reagir(
        message,
        resultado === '𝐒𝐈𝐌'
            ? '✅'
            : '❌'
    );

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
├✯ *🔮 𝐒𝐈𝐌 𝐎𝐔 𝐍𝐀̃𝐎*
│
├➤ *𝐏𝐄𝐑𝐆𝐔𝐍𝐓𝐀:*
│   _${pergunta}_
│
├➤ *𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀:*
│
│   ✦ *${resultado}* ✦
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// RPG
// ============================================================

async function acaoRPG(
    message,
    tipo,
    emoji,
    frases
) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const frase =
        frases[
            Math.floor(
                Math.random() *
                frases.length
            )
        ];

    const valor =
        Math.floor(
            Math.random() * 31
        ) + 10;

    await reagir(message, emoji);

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *${emoji} 𝐑𝐏𝐆*
├✯
├➤ _${frase} ${mencao}_
│
├➤ *𝐀𝐋𝐕𝐎:* ${mencao}
├➤ *💥 𝐃𝐀𝐍𝐎 𝐅𝐈𝐂𝐓𝐈́𝐂𝐈𝐎:* ${valor}
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function tapa(message) {
    await acaoRPG(
        message,
        'tapa',
        '🖐️',
        [
            'Você deu um tapa cinematográfico em',
            'Você aplicou um tapinha lendário em',
            'Você mandou aquele tapa de respeito em'
        ]
    );
}

async function soco(message) {
    await acaoRPG(
        message,
        'soco',
        '👊',
        [
            'Você acertou um soco fictício em',
            'Você lançou um soco poderoso contra',
            'Você acertou um golpe crítico em'
        ]
    );
}

async function chuteRPG(message) {
    await acaoRPG(
        message,
        'chute',
        '🦵',
        [
            'Você deu um chute voador em',
            'Você aplicou um chute giratório em',
            'Você acertou um chute cinematográfico em'
        ]
    );
}

async function empurrar(message) {
    await acaoRPG(
        message,
        'empurrar',
        '💨',
        [
            'Você empurrou',
            'Você deu um empurrão fictício em',
            'Você lançou'
        ]
    );
}

async function abracar(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    await reagir(message, '🫂');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *🫂 𝐀𝐁𝐑𝐀𝐂̧𝐎*
├✯
├➤ _Você deu um abraço em ${mencao}!_
│
├➤ *💖 +100 𝐂𝐀𝐑𝐈𝐍𝐇𝐎*
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function proteger(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    await reagir(message, '🛡️');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *🛡️ 𝐏𝐑𝐎𝐓𝐄𝐆𝐄𝐑*
├✯
├➤ _Você está protegendo ${mencao}!_
│
├➤ *🛡️ 𝐃𝐄𝐅𝐄𝐒𝐀 𝐀𝐔𝐌𝐄𝐍𝐓𝐀𝐃𝐀*
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function curar(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const cura =
        Math.floor(
            Math.random() * 41
        ) + 10;

    await reagir(message, '💚');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *💚 𝐂𝐔𝐑𝐀*
├✯
├➤ _Você curou ${mencao}!_
│
├➤ *❤️ +${cura} HP 𝐅𝐈𝐂𝐓𝐈́𝐂𝐈𝐎*
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function elogiar(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const elogios = [
        'Você é incrível!',
        'Você é uma lenda!',
        'Você é simplesmente brabo!',
        'Você mandou muito bem!',
        'Você merece um troféu!'
    ];

    const elogio =
        elogios[
            Math.floor(
                Math.random() *
                elogios.length
            )
        ];

    await reagir(message, '⭐');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *⭐ 𝐄𝐋𝐎𝐆𝐈𝐎*
├✯
├➤ ${mencao}
│
├➤ _${elogio}_
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function zoar(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const zoeiras = [
        'perdeu até para o tutorial.',
        'precisa urgentemente de um buff.',
        'foi derrotado pelo próprio lag.',
        'entrou no modo NPC.',
        'tomou um crítico psicológico.'
    ];

    const zoeira =
        zoeiras[
            Math.floor(
                Math.random() *
                zoeiras.length
            )
        ];

    await reagir(message, '😂');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *😂 𝐙𝐎𝐀𝐑*
├✯
├➤ ${mencao} _${zoeira}_
│
├➤ *💀 𝐃𝐀𝐍𝐎 𝐄𝐌𝐎𝐂𝐈𝐎𝐍𝐀𝐋: 999*
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function duelo(message) {
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const seuPoder =
        Math.floor(
            Math.random() * 100
        ) + 1;

    const poderInimigo =
        Math.floor(
            Math.random() * 100
        ) + 1;

    let resultado;

    if (seuPoder > poderInimigo) {
        resultado =
            '🏆 *𝐕𝐎𝐂𝐄̂ 𝐕𝐄𝐍𝐂𝐄𝐔 𝐎 𝐃𝐔𝐄𝐋𝐎!*';
    } else if (
        seuPoder < poderInimigo
    ) {
        resultado =
            '💀 *𝐕𝐎𝐂𝐄̂ 𝐏𝐄𝐑𝐃𝐄𝐔 𝐎 𝐃𝐔𝐄𝐋𝐎!*';
    } else {
        resultado =
            '🤝 *𝐄𝐌𝐏𝐀𝐓𝐄!*';
    }

    await reagir(message, '⚔️');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *⚔️ 𝐃𝐔𝐄𝐋𝐎*
├✯
├➤ *𝐕𝐎𝐂𝐄̂ VS ${mencao}*
│
├➤ *𝐒𝐄𝐔 𝐏𝐎𝐃𝐄𝐑:* ${seuPoder}
├➤ *𝐎𝐏𝐎𝐍𝐄𝐍𝐓𝐄:* ${poderInimigo}
│
├✯ ${resultado}
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
}

async function roubar(message) {
    try {
        if (!message.from.endsWith('@g.us')) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Roubo só pode ser feito em grupos._');
            return;
        }

        const pessoa = await exigirPessoa(message);
        if (!pessoa) return;

        const ladrao = await resolverIdEconomia(obterIdRemetente(message));
        const vitima = await resolverIdEconomia(pessoa);
        if (!ladrao || !vitima || idsIguais(ladrao, vitima)) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Você não pode roubar a si mesmo._');
            return;
        }

        const agora = Date.now();
        const chaveCooldown = `${ladrao}:${vitima}`;
        const ultimoAlvo = cooldownsRoubo.get(chaveCooldown) || 0;
        const restanteAlvo = INTERVALO_MESMA_VITIMA - (agora - ultimoAlvo);

        if (ultimoAlvo && restanteAlvo > 0) {
            const horas = Math.floor(restanteAlvo / 3600000);
            const minutos = Math.ceil((restanteAlvo % 3600000) / 60000);
            await reagir(message, '⏳');
            await responderCitando(message, `⏳ _Você já tentou roubar ${mencaoDaPessoa(pessoa)} recentemente._\n\nVolte em aproximadamente *${horas}h ${minutos}min*.`, { mentions: [vitima] });
            return;
        }

        const ultimoRoubo = cooldownsRoubo.get(`${ladrao}:geral`) || 0;
        if (agora - ultimoRoubo < INTERVALO_ROUBO) {
            const restante = INTERVALO_ROUBO - (agora - ultimoRoubo);
            const minutos = Math.ceil(restante / 60000);
            await reagir(message, '⏳');
            await responderCitando(message, `⏳ _Você precisa esperar mais *${minutos} min* antes de tentar outro roubo._`);
            return;
        }

        const carteiraLadrao = garantirCarteira(ladrao);
        const carteiraVitima = garantirCarteira(vitima);
        const mencao = mencaoDaPessoa(pessoa);
        const saldoVitima = carteiraVitima.saldo;

        if (saldoVitima < 50) {
            cooldownsRoubo.set(chaveCooldown, agora);
            cooldownsRoubo.set(`${ladrao}:geral`, agora);
            salvarMoedas();
            await reagir(message, '💸');
            await responderCitando(message, `💸 _${mencao} está praticamente sem moedas para roubar._`);
            return;
        }

        cooldownsRoubo.set(chaveCooldown, agora);
        cooldownsRoubo.set(`${ladrao}:geral`, agora);
        salvarMoedas();

        const luvas = quantidadeItem(ladrao, 'luvas');
        const chanceSucesso = Math.min(0.82, 0.62 + luvas * 0.05);
        const sorte = Math.random();
        const valorRoubo = Math.max(10, Math.min(1000, Math.floor(saldoVitima * (0.10 + Math.random() * 0.16))));

        if (sorte < chanceSucesso) {
            transferirMoedas(vitima, ladrao, Math.min(valorRoubo, carteiraVitima.saldo), 'roubo', 'Roubo bem-sucedido');
            carteiraLadrao.roubosSucesso += 1;
            salvarMoedas();

            await reagir(message, '🥷');
            await responderCitando(message, `┏═•❃༺🥷༻❃•═┓
├✯ *𝐑𝐎𝐔𝐁𝐎 𝐁𝐄𝐌-𝐒𝐔𝐂𝐄𝐃𝐈𝐃𝐎!*
│
├➤ Você roubou *${formatarMoedas(valorRoubo)} 🪙* de ${mencao}!
├➤ 🥷 Chance extra das luvas: *${luvas}x*
│
├➤ 💰 Seu saldo: *${formatarMoedas(carteiraLadrao.saldo)} 🪙*
│
┗═•❃༺🥷༻❃•═┛` , { mentions: [vitima] });
            return;
        }

        const dados = dadosRoubo.get(ladrao) || { pegos: 0 };
        dados.pegos += 1;
        dadosRoubo.set(ladrao, dados);

        if (dados.pegos < 2) {
            salvarMoedas();
            await reagir(message, '🚨');
            await responderCitando(message, `┏═•❃༺🚨༻❃•═┓
├✯ *𝐕𝐎𝐂𝐄̂ 𝐅𝐎𝐈 𝐏𝐄𝐆𝐎!*
│
├➤ ${mencao} percebeu o roubo!
├➤ 🚨 Primeira captura registrada.
├➤ ⚠️ Na *segunda captura*, você poderá perder parte do seu saldo para a vítima.
│
┗═•❃༺🚨༻❃•═┛`, { mentions: [vitima] });
            return;
        }

        dados.pegos = 0;
        const colete = quantidadeItem(ladrao, 'colete');
        if (colete > 0) {
            consumirItem(ladrao, 'colete');
            salvarMoedas();
            await reagir(message, '🛡️');
            await responderCitando(message, `┏═•❃༺🛡️༻❃•═┓
├✯ *𝐂𝐎𝐋𝐄𝐓𝐄 𝐀𝐓𝐈𝐕𝐀𝐃𝐎!*
│
├➤ Você foi pego pela *segunda vez*.
├➤ 🛡️ Seu Colete Anti-Punição absorveu a perda!
├➤ ${mencao} não recebeu moedas desta vez.
│
┗═•❃༺🛡️༻❃•═┛`, { mentions: [vitima] });
            return;
        }

        const perda = Math.min(carteiraLadrao.saldo, Math.max(100, Math.floor(carteiraLadrao.saldo * 0.20)));
        if (perda > 0) {
            transferirMoedas(ladrao, vitima, perda, 'punição_roubo', 'Segunda captura no roubo');
        }

        await reagir(message, '💸');
        await responderCitando(message, `┏═•❃༺💸༻❃•═┓
├✯ *𝐒𝐄𝐆𝐔𝐍𝐃𝐀 𝐂𝐀𝐏𝐓𝐔𝐑𝐀!*
│
├➤ 🚨 Você foi pego roubando ${mencao} pela segunda vez.
├➤ 💸 Multa: *${formatarMoedas(perda)} 🪙*
├➤ 💰 Esse dinheiro foi entregue à vítima.
│
├➤ Seu saldo: *${formatarMoedas(carteiraLadrao.saldo)} 🪙*
│
┗═•❃༺💸༻❃•═┛`, { mentions: [vitima] });
    } catch (erro) {
        console.error('❌ Erro no sistema de roubo:', erro);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Ocorreu um erro ao executar o roubo._');
    }
}

async function aventura(message) {
    const eventos = [
        '🏰 Você encontrou um castelo abandonado!',
        '🐉 Um dragão apareceu no caminho!',
        '💎 Você encontrou um tesouro escondido!',
        '🌲 Você entrou em uma floresta misteriosa!',
        '🧙 Um mago ofereceu uma missão!',
        '🕳️ Você caiu em uma passagem secreta!'
    ];

    const evento =
        eventos[
            Math.floor(
                Math.random() *
                eventos.length
            )
        ];

    const xp =
        Math.floor(
            Math.random() * 101
        ) + 20;

    await reagir(message, '🗺️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🗺️ 𝐀𝐕𝐄𝐍𝐓𝐔𝐑𝐀*
├✯
├➤ _${evento}_
│
├➤ *✨ XP GANHO: ${xp}*
│
├➤ _A aventura continua..._
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// PEDRA PAPEL TESOURA
// ============================================================

async function jogarPPT(
    message,
    argumento = ''
) {
   const escolha =
    argumento
        .toLowerCase()
        .trim();

if (!escolha) {
    await reagir(message, '❌');

    await responderCitando(
        message,
        `❌ *𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐀.*

_Use:_

*${PREFIXO}ppt pedra*
*${PREFIXO}ppt papel*
*${PREFIXO}ppt tesoura*`
    );

    return;
}

    const opcoes = [
        'pedra',
        'papel',
        'tesoura'
    ];

    if (!opcoes.includes(escolha)) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀!*

_Use:_
*${PREFIXO}ppt pedra*
*${PREFIXO}ppt papel*
*${PREFIXO}ppt tesoura*`
        );

        return;
    }

    const bot =
        opcoes[
            Math.floor(
                Math.random() *
                opcoes.length
            )
        ];

    let resultado;

    if (escolha === bot) {
        resultado =
            '🤝 *𝐄𝐌𝐏𝐀𝐓𝐄!*';
    } else if (
        (escolha === 'pedra' &&
            bot === 'tesoura') ||
        (escolha === 'papel' &&
            bot === 'pedra') ||
        (escolha === 'tesoura' &&
            bot === 'papel')
    ) {
        resultado =
            '🏆 *𝐕𝐎𝐂𝐄̂ 𝐕𝐄𝐍𝐂𝐄𝐔!*';
    } else {
        resultado =
            '💀 *𝐕𝐎𝐂𝐄̂ 𝐏𝐄𝐑𝐃𝐄𝐔!*';
    }

    await reagir(message, '🎮');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🎮 𝐏𝐏𝐓*
├✯
├➤ *𝐕𝐎𝐂𝐄̂:* _${escolha}_
├➤ *𝐁𝐎𝐓:* _${bot}_
│
├✯ ${resultado}
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// ADIVINHAÇÃO
// ============================================================

async function iniciarAdivinhacao(message) {
    const numero =
        Math.floor(
            Math.random() * 10
        ) + 1;

    jogosAdivinhacao.set(
        message.from,
        numero
    );

    await reagir(message, '🔢');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🔢 𝐀𝐃𝐈𝐕𝐈𝐍𝐇𝐀*
├✯
├➤ _Pensei em um número entre 1 e 10!_
│
├➤ *🎯 ${PREFIXO}chute número*
│   _Tente acertar._
│
┗═•❃༺✿༻❃•═┛`
    );
}

async function fazerChute(
    message,
    argumento
) {
    const numeroEscolhido =
        Number(argumento);

    const numeroCorreto =
        jogosAdivinhacao.get(
            message.from
        );

    if (!numeroCorreto) {
        await responderCitando(
            message,
            `❌ *𝐍𝐄𝐍𝐇𝐔𝐌 𝐉𝐎𝐆𝐎 𝐀𝐓𝐈𝐕𝐎.*

_Digite:_
*${PREFIXO}adivinha*`
        );

        return;
    }

    if (
        !Number.isInteger(
            numeroEscolhido
        ) ||
        numeroEscolhido < 1 ||
        numeroEscolhido > 10
    ) {
        await responderCitando(
            message,
            '❌ _Digite um número entre 1 e 10._'
        );

        return;
    }

    if (
        numeroEscolhido ===
        numeroCorreto
    ) {
        jogosAdivinhacao.delete(
            message.from
        );

        await reagir(
            message,
            '🎉'
        );

        await responderCitando(
            message,
            `🎉 *𝐀𝐂𝐄𝐑𝐓𝐎𝐔!*

_O número era_ *${numeroCorreto}*!`
        );

        return;
    }

    await reagir(message, '❌');

    await responderCitando(
        message,
        `❌ *𝐄𝐑𝐑𝐎𝐔!*

_O número é_ *${numeroEscolhido < numeroCorreto
            ? 'MAIOR'
            : 'MENOR'}*.`
    );
}


// ============================================================
// 🌐 COMANDOS DE APIS PÚBLICAS
// ============================================================

async function buscarJsonAPI(url, opcoes = {}) {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), opcoes.timeout || 12000);
    try {
        const resposta = await fetch(url, {
            method: opcoes.method || 'GET',
            headers: {
                'Accept': 'application/json',
                ...(opcoes.headers || {})
            },
            body: opcoes.body,
            signal: controlador.signal
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        return await resposta.json();
    } finally {
        clearTimeout(timeout);
    }
}

function limparTextoAPI(texto) {
    return String(texto || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

function limitarTextoAPI(texto, limite = 500) {
    const valor = limparTextoAPI(texto);
    return valor.length <= limite ? valor : `${valor.slice(0, limite - 3).trim()}...`;
}

function nomeFormatadoAPI(nome) {
    return String(nome || '').split('-').map(parte => parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : parte).join(' ');
}

async function comandoPokemon(message, argumentos) {
    const nome = String(argumentos || '').trim().toLowerCase();
    if (!nome) { await reagir(message, '❌'); await responderCitando(message, `❌ _Informe um Pokémon._\n\nExemplo: *${PREFIXO}pokemon pikachu*`); return; }
    try {
        const pokemon = await buscarJsonAPI(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`);
        const tipos = (pokemon.types || []).sort((a,b) => a.slot-b.slot).map(item => nomeFormatadoAPI(item.type?.name)).join(' / ');
        const habilidades = (pokemon.abilities || []).filter(item => item.ability?.name).map(item => nomeFormatadoAPI(item.ability.name)).slice(0,3).join(', ');
        const stats = Object.fromEntries((pokemon.stats || []).map(item => [item.stat?.name, item.base_stat]));
        const texto = `┏═•❃༺⚡༻❃•═┓\n│      *𝐏𝐎𝐊𝐄́𝐌𝐎𝐍*\n├✯\n│\n├➤ 🆔 *#${String(pokemon.id).padStart(4,'0')}*\n├➤ 🐾 *${nomeFormatadoAPI(pokemon.name)}*\n├➤ 🔥 Tipo: *${tipos || 'Desconhecido'}*\n├➤ 📏 Altura: *${(pokemon.height/10).toFixed(1)} m*\n├➤ ⚖️ Peso: *${(pokemon.weight/10).toFixed(1)} kg*\n│\n├➤ ❤️ HP: *${stats.hp ?? '?'}*\n├➤ ⚔️ Ataque: *${stats.attack ?? '?'}*\n├➤ 🛡️ Defesa: *${stats.defense ?? '?'}*\n├➤ ✨ Ataque Esp.: *${stats['special-attack'] ?? '?'}*\n├➤ 🌀 Defesa Esp.: *${stats['special-defense'] ?? '?'}*\n├➤ 💨 Velocidade: *${stats.speed ?? '?'}*\n│\n├➤ 🧬 Habilidades: *${habilidades || 'Desconhecidas'}*\n│\n┗═•❃༺⚡༻❃•═┛`;
        await reagir(message,'⚡'); await responderCitando(message,texto);
    } catch (erro) { console.error('❌ Erro na API do Pokémon:',erro.message); await reagir(message,'❌'); await responderCitando(message,`❌ _Não encontrei o Pokémon_ *${nome}* _na PokéAPI._`); }
}

async function comandoPiadaAPI(message) {
    try {
        const dados = await buscarJsonAPI('https://v2.jokeapi.dev/joke/Any?lang=pt&blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
        if (dados.error) throw new Error(dados.message || 'API sem piada.');
        const piada = dados.type === 'twopart' ? `${limparTextoAPI(dados.setup)}\n\n${limparTextoAPI(dados.delivery)}` : limparTextoAPI(dados.joke);
        if (!piada) throw new Error('Piada vazia.');
        await reagir(message,'😂'); await responderCitando(message,`┏═•❃༺😂༻❃•═┓\n│      *𝐏𝐈𝐀𝐃𝐀 𝐃𝐀 𝐀𝐏𝐈*\n├✯\n│\n├➤ ${piada}\n│\n┗═•❃༺😂༻❃•═┛`);
    } catch (erro) { console.error('❌ Erro na API de piadas:',erro.message); await reagir(message,'❌'); await responderCitando(message,'❌ _Não consegui buscar uma piada agora. Tente novamente em alguns segundos._'); }
}

async function comandoAnime(message, argumentos) {
    const busca = String(argumentos || '').trim();
    if (!busca) { await reagir(message,'❌'); await responderCitando(message,`❌ _Informe o nome de um anime._\n\nExemplo: *${PREFIXO}anime naruto*`); return; }
    try {
        const dados = await buscarJsonAPI(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(busca)}&limit=1`); const anime = dados?.data?.[0];
        if (!anime) throw new Error('Anime não encontrado.');
        const ano = anime.year || anime.aired?.prop?.from?.slice?.(0,4) || 'N/A'; const generos = (anime.genres || []).slice(0,5).map(g => g.name).join(', ') || 'N/A';
        const texto = `┏═•❃༺🍥༻❃•═┓\n│        *𝐀𝐍𝐈𝐌𝐄*\n├✯\n│\n├➤ 🎬 *${limparTextoAPI(anime.title)}*\n├➤ ⭐ Nota: *${anime.score ?? 'N/A'}*\n├➤ 📺 Episódios: *${anime.episodes ?? 'N/A'}*\n├➤ 📅 Ano: *${ano}*\n├➤ 📌 Status: *${limparTextoAPI(anime.status || 'N/A')}*\n├➤ 🏷️ Gêneros: *${limparTextoAPI(generos)}*\n│\n├➤ 📝 *Sinopse:*\n│   ${limitarTextoAPI(anime.synopsis || 'Sinopse não disponível.',650)}\n│\n┗═•❃༺🍥༻❃•═┛`;
        await reagir(message,'🍥'); await responderCitando(message,texto);
    } catch (erro) { console.error('❌ Erro na API de anime:',erro.message); await reagir(message,'❌'); await responderCitando(message,`❌ _Não consegui encontrar o anime_ *${busca}* _agora._`); }
}

function embaralharAPI(lista) { const copia=[...lista]; for(let i=copia.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copia[i],copia[j]]=[copia[j],copia[i]];} return copia; }

async function comandoQuizAPI(message) {
    try {
        const dados=await buscarJsonAPI('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
        if(!dados?.results?.length || dados.response_code!==0) throw new Error(`Open Trivia DB response_code=${dados?.response_code}`);
        const bruto=dados.results[0]; const pergunta=limparTextoAPI(decodeURIComponent(bruto.question)); const correta=limparTextoAPI(decodeURIComponent(bruto.correct_answer));
        const alternativas=embaralharAPI([correta,...(bruto.incorrect_answers||[]).map(x=>limparTextoAPI(decodeURIComponent(x)))]); const letras=['a','b','c','d']; const respostaCorreta=letras[alternativas.findIndex(x=>x===correta)];
        const opcoes=alternativas.map((x,i)=>`${letras[i].toUpperCase()}) ${x}`).join('\n'); quizzes.set(message.from,{pergunta,opcoes,resposta:respostaCorreta});
        await reagir(message,'🧠'); await responderCitando(message,`┏═•❃༺🧠༻❃•═┓\n│      *𝐐𝐔𝐈𝐙 𝐃𝐀 𝐀𝐏𝐈*\n├✯\n│\n├➤ _${pergunta}_\n│\n${opcoes}\n│\n├➤ *📝 ${PREFIXO}quiz a/b/c/d*\n│   _Escolha uma alternativa._\n│\n┗═•❃༺🧠༻❃•═┛`);
    } catch (erro) { console.error('❌ Erro na API do quiz:',erro.message); await reagir(message,'❌'); await responderCitando(message,'❌ _Não consegui buscar uma pergunta agora. Tente novamente em alguns segundos._'); }
}

async function comandoClima(message, argumentos) {
    const cidade=String(argumentos||'').trim(); if(!cidade){await reagir(message,'❌');await responderCitando(message,`❌ _Informe uma cidade._\n\nExemplo: *${PREFIXO}clima São Paulo*`);return;}
    try {
        const geo=await buscarJsonAPI(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`); const local=geo?.results?.[0]; if(!local) throw new Error('Cidade não encontrada.');
        const clima=await buscarJsonAPI(`https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto`);
        const codigos={0:'☀️ Céu limpo',1:'🌤️ Principalmente limpo',2:'⛅ Parcialmente nublado',3:'☁️ Nublado',45:'🌫️ Nevoeiro',48:'🌫️ Nevoeiro com geada',51:'🌦️ Chuvisco leve',53:'🌦️ Chuvisco moderado',55:'🌧️ Chuvisco intenso',61:'🌦️ Chuva leve',63:'🌧️ Chuva moderada',65:'🌧️ Chuva forte',71:'🌨️ Neve leve',73:'🌨️ Neve moderada',75:'❄️ Neve forte',80:'🌦️ Pancadas de chuva',81:'🌧️ Pancadas moderadas',82:'⛈️ Pancadas fortes',95:'⛈️ Trovoada',96:'⛈️ Trovoada com granizo',99:'⛈️ Trovoada forte com granizo'}; const atual=clima.current||{}; const diaria=clima.daily||{}; const regiao=[local.admin1,local.country].filter(Boolean).join(', ');
        const texto=`┏═•❃༺🌦️༻❃•═┓\n│       *𝐂𝐋𝐈𝐌𝐀*\n├✯\n│\n├➤ 📍 *${local.name||cidade}*\n├➤ 🌎 ${regiao}\n│\n├➤ ${codigos[atual.weather_code]||'🌡️ Condição desconhecida'}\n├➤ 🌡️ Temperatura: *${atual.temperature_2m??'?'}°C*\n├➤ 🤒 Sensação: *${atual.apparent_temperature??'?'}°C*\n├➤ 💧 Umidade: *${atual.relative_humidity_2m??'?'}%*\n├➤ 💨 Vento: *${atual.wind_speed_10m??'?'} km/h*\n│\n├➤ 🔺 Máxima: *${diaria.temperature_2m_max?.[0]??'?'}°C*\n├➤ 🔻 Mínima: *${diaria.temperature_2m_min?.[0]??'?'}°C*\n├➤ ☔ Chance de chuva: *${diaria.precipitation_probability_max?.[0]??'?'}%*\n│\n┗═•❃༺🌦️༻❃•═┛`; await reagir(message,'🌦️'); await responderCitando(message,texto);
    } catch(erro){console.error('❌ Erro na API de clima:',erro.message);await reagir(message,'❌');await responderCitando(message,`❌ _Não consegui consultar o clima de_ *${cidade}* _agora._`);}
}

// ============================================================
// 🌐 NOVAS APIS: QR, SHAZAM, FUTEBOL, F1 E QUALIDADE DO AR
// ============================================================

async function comandoQR(message, argumentos) {
    const conteudo = String(argumentos || '').trim();
    if (!conteudo) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe o texto ou link para gerar o QR Code._\n\nExemplo: *${PREFIXO}qr https://youtube.com*`);
        return;
    }

    if (conteudo.length > 900) {
        await reagir(message, '❌');
        await responderCitando(message, '❌ _O conteúdo do QR Code é grande demais. Tente usar até 900 caracteres._');
        return;
    }

    try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=700x700&format=png&data=${encodeURIComponent(conteudo)}`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const bytes = Buffer.from(await resposta.arrayBuffer());
        const midia = new MessageMedia('image/png', bytes.toString('base64'), 'qrcode.png');

        await reagir(message, '📱');
        await client.sendMessage(message.from, midia, {
            caption: `📱 *𝐐𝐑 𝐂𝐎𝐃𝐄*\n\n🔗 _Conteúdo codificado com sucesso._`
        });
    } catch (erro) {
        console.error('❌ Erro na API de QR Code:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui gerar o QR Code agora. Tente novamente em alguns segundos._');
    }
}

async function converterAudioParaPCM(caminhoEntrada) {
    return new Promise((resolve, reject) => {
        const processo = spawn(ffmpeg, [
            '-hide_banner',
            '-loglevel', 'error',
            '-i', caminhoEntrada,
            '-f', 's16le',
            '-acodec', 'pcm_s16le',
            '-ac', '1',
            '-ar', '44100',
            'pipe:1'
        ]);

        const partes = [];
        let tamanho = 0;

        processo.stdout.on('data', parte => {
            if (tamanho < 780000) {
                const restante = 780000 - tamanho;
                const recorte = parte.length > restante ? parte.subarray(0, restante) : parte;
                partes.push(recorte);
                tamanho += recorte.length;
            }
        });

        let erroFFmpeg = '';
        processo.stderr.on('data', parte => {
            erroFFmpeg += parte.toString();
        });

        processo.on('error', reject);
        processo.on('close', codigo => {
            if (codigo !== 0) {
                reject(new Error(`FFmpeg terminou com código ${codigo}: ${erroFFmpeg.trim()}`));
                return;
            }
            const pcm = Buffer.concat(partes);
            if (!pcm.length) {
                reject(new Error('Nenhum áudio PCM foi produzido.'));
                return;
            }
            resolve(pcm);
        });
    });
}

async function comandoShazam(message) {
    if (!SHAZAM_API_KEY) {
        await reagir(message, '🔑');
        await responderCitando(message, '🔑 *𝐒𝐇𝐀𝐙𝐀𝐌 𝐍𝐀̃𝐎 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎*\n\n_O comando precisa da variável de ambiente_ `SHAZAM_API_KEY` _no computador/servidor do bot._');
        return;
    }

    if (!message.hasMedia) {
        await reagir(message, '🎵');
        await responderCitando(message, `🎵 _Envie um áudio junto com_ *${PREFIXO}shazam* _ou responda a um áudio com o comando._`);
        return;
    }

    const pastaTemporaria = path.join(os.tmpdir(), 'justbot-shazam');
    fs.mkdirSync(pastaTemporaria, { recursive: true });
    const idTemporario = `${Date.now()}-${String(message.id?.id || 'audio').replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const arquivoEntrada = path.join(pastaTemporaria, `${idTemporario}.audio`);

    try {
        await reagir(message, '🎵');
        const midia = await message.downloadMedia();
        if (!midia || !midia.data) throw new Error('Não foi possível baixar o áudio.');

        fs.writeFileSync(arquivoEntrada, Buffer.from(midia.data, 'base64'));
        const pcm = await converterAudioParaPCM(arquivoEntrada);
        const base64PCM = pcm.toString('base64');

        const controlador = new AbortController();
        const timeout = setTimeout(() => controlador.abort(), 20000);
        let resposta;
        try {
            resposta = await fetch('https://shazam.p.rapidapi.com/songs/v2/detect?timezone=America%2FSao_Paulo&locale=pt-BR', {
                method: 'POST',
                headers: {
                    'content-type': 'text/plain',
                    'X-RapidAPI-Key': SHAZAM_API_KEY,
                    'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
                },
                body: base64PCM,
                signal: controlador.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const dados = await resposta.json();
        const faixa = dados?.track;

        if (!faixa || !faixa.title) {
            await reagir(message, '❓');
            await responderCitando(message, '❓ _Não consegui identificar essa música. Tente enviar um trecho com áudio mais limpo e com alguns segundos de duração._');
            return;
        }

        const metadados = Array.isArray(faixa.sections?.[0]?.metadata) ? faixa.sections[0].metadata : [];
        const album = metadados.find(item => item.title === 'Album')?.text || 'N/A';
        const lancamento = metadados.find(item => item.title === 'Released')?.text || 'N/A';
        const genero = faixa.genres?.primary || 'N/A';
        const capaUrl = faixa.images?.coverart || faixa.images?.coverarthq || null;
        const urlFaixa = faixa.url || null;

        const texto = `┏═•❃༺🎵༻❃•═┓\n│       *𝐒𝐇𝐀𝐙𝐀𝐌*\n├✯\n│\n├➤ 🎶 *${limparTextoAPI(faixa.title)}*\n├➤ 👤 Artista: *${limparTextoAPI(faixa.subtitle || 'N/A')}*\n├➤ 💿 Álbum: *${limparTextoAPI(album)}*\n├➤ 📅 Lançamento: *${limparTextoAPI(lancamento)}*\n├➤ 🎼 Gênero: *${limparTextoAPI(genero)}*\n${urlFaixa ? `├➤ 🔗 ${urlFaixa}\n` : ''}│\n┗═•❃༺🎵༻❃•═┛`;

        if (capaUrl) {
            try {
                const capaResposta = await fetch(capaUrl);
                if (capaResposta.ok) {
                    const capaBytes = Buffer.from(await capaResposta.arrayBuffer());
                    const capa = new MessageMedia('image/jpeg', capaBytes.toString('base64'), 'shazam.jpg');
                    await client.sendMessage(message.from, capa, { caption: texto });
                    return;
                }
            } catch (erroCapa) {
                console.log('⚠️ Não foi possível baixar a capa do Shazam:', erroCapa.message);
            }
        }

        await responderCitando(message, texto);
    } catch (erro) {
        console.error('❌ Erro na API do Shazam:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui identificar a música agora. Verifique se a chave do Shazam está válida e tente novamente._');
    } finally {
        try {
            if (fs.existsSync(arquivoEntrada)) fs.unlinkSync(arquivoEntrada);
        } catch (erroLimpeza) {
            console.log('⚠️ Não foi possível limpar arquivo temporário do Shazam:', erroLimpeza.message);
        }
    }
}

async function buscarApiFootball(endpoint, parametros = {}) {
    if (!API_FOOTBALL_KEY) throw new Error('API_FOOTBALL_KEY não configurada.');
    const query = new URLSearchParams(parametros).toString();
    const url = `https://v3.football.api-sports.io/${endpoint}${query ? `?${query}` : ''}`;
    const dados = await buscarJsonAPI(url, {
        timeout: 15000,
        headers: {
            'x-apisports-key': API_FOOTBALL_KEY
        }
    });
    if (dados?.errors && Object.keys(dados.errors).length > 0) {
        throw new Error(Object.values(dados.errors).join(', '));
    }
    return dados;
}

function dataHojeSaoPaulo() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}

function formatarHoraFutebol(dataISO) {
    if (!dataISO) return '--:--';
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dataISO));
    } catch {
        return '--:--';
    }
}

async function comandoFutebol(message, argumentos) {
    if (!API_FOOTBALL_KEY) {
        await reagir(message, '🔑');
        await responderCitando(message, '🔑 *𝐅𝐔𝐓𝐄𝐁𝐎𝐋 𝐍𝐀̃𝐎 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎*\n\n_O comando precisa da variável de ambiente_ `API_FOOTBALL_KEY` _no computador/servidor do bot._');
        return;
    }

    const modo = String(argumentos || '').trim().toLowerCase();
    try {
        const aoVivo = ['ao vivo', 'aovivo', 'live'].includes(modo);
        const dados = aoVivo
            ? await buscarApiFootball('fixtures', { live: 'all' })
            : await buscarApiFootball('fixtures', { date: dataHojeSaoPaulo() });
        const jogos = Array.isArray(dados?.response) ? dados.response : [];

        if (!jogos.length) {
            await reagir(message, '⚽');
            await responderCitando(message, aoVivo ? '⚽ _Não há partidas ao vivo encontradas agora._' : `⚽ _Não encontrei partidas para_ *${dataHojeSaoPaulo()}* _nas competições disponíveis._`);
            return;
        }

        const lista = jogos.slice(0, 12).map(jogo => {
            const status = jogo.fixture?.status?.short || 'N/A';
            const tempo = formatarHoraFutebol(jogo.fixture?.date);
            const casa = jogo.teams?.home?.name || '?';
            const fora = jogo.teams?.away?.name || '?';
            const golsCasa = jogo.goals?.home;
            const golsFora = jogo.goals?.away;
            const placar = golsCasa !== null && golsCasa !== undefined && golsFora !== null && golsFora !== undefined
                ? `*${golsCasa} x ${golsFora}*`
                : `_vs_`;
            const competicao = jogo.league?.name || 'Competição';
            return `├➤ 🏆 *${limitarTextoAPI(competicao, 45)}*\n│   🕐 ${tempo} • *${status}*\n│   ⚽ ${limitarTextoAPI(casa, 28)} ${placar} ${limitarTextoAPI(fora, 28)}`;
        }).join('\n│\n');

        const titulo = aoVivo ? '𝐅𝐔𝐓𝐄𝐁𝐎𝐋 𝐀𝐎 𝐕𝐈𝐕𝐎' : `𝐅𝐔𝐓𝐄𝐁𝐎𝐋 • ${dataHojeSaoPaulo()}`;
        await reagir(message, '⚽');
        await responderCitando(message, `┏═•❃༺⚽༻❃•═┓\n│      *${titulo}*\n├✯\n│\n${lista}\n│\n├➤ _Mostrando até 12 partidas._\n┗═•❃༺⚽༻❃•═┛`);
    } catch (erro) {
        console.error('❌ Erro na API de futebol:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui consultar os jogos agora. A API pode estar temporariamente indisponível ou a chave pode ter atingido o limite diário._');
    }
}

async function buscarF1API(caminho) {
    return buscarJsonAPI(`https://api.jolpi.ca/ergast/f1/${caminho}`, {
        timeout: 15000,
        headers: {
            'User-Agent': `JUST-BOT/${VERSAO}`
        }
    });
}

function extrairMRData(dados) {
    return dados?.MRData || dados?.mrData || {};
}

async function comandoF1(message, argumentos) {
    const modo = String(argumentos || '').trim().toLowerCase();
    try {
        if (!modo || ['proxima', 'próxima', 'next'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/next/races/?limit=1'));
            const corrida = dados?.RaceTable?.Races?.[0];
            if (!corrida) throw new Error('Próxima corrida não encontrada.');
            const data = corrida.date ? new Date(`${corrida.date}T${corrida.time || '00:00:00Z'}`).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
            const circuito = corrida.Circuit?.circuitName || 'N/A';
            const local = corrida.Circuit?.Location?.locality && corrida.Circuit?.Location?.country ? `${corrida.Circuit.Location.locality}, ${corrida.Circuit.Location.country}` : 'N/A';
            await reagir(message, '🏎️');
            await responderCitando(message, `┏═•❃༺🏎️༻❃•═┓\n│       *𝐅𝟏 • 𝐏𝐑𝐎́𝐗𝐈𝐌𝐀*\n├✯\n│\n├➤ 🏁 *${limparTextoAPI(corrida.raceName)}*\n├➤ 📍 ${limparTextoAPI(circuito)}\n├➤ 🌎 ${limparTextoAPI(local)}\n├➤ 📅 ${data}\n├➤ 🔢 Rodada: *${corrida.round || 'N/A'}*\n│\n┗═•❃༺🏎️༻❃•═┛`);
            return;
        }

        if (['calendario', 'calendar', 'corridas'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/races/?limit=30'));
            const corridas = dados?.RaceTable?.Races || [];
            if (!corridas.length) throw new Error('Calendário vazio.');
            const lista = corridas.map(corrida => `├➤ *${corrida.round || '?'}.* ${limparTextoAPI(corrida.raceName)}\n│   📅 ${corrida.date || 'N/A'} • 📍 ${limparTextoAPI(corrida.Circuit?.circuitName || 'N/A')}`).join('\n│\n');
            await reagir(message, '📅');
            await responderCitando(message, `┏═•❃༺🏎️༻❃•═┓\n│       *𝐂𝐀𝐋𝐄𝐍𝐃𝐀́𝐑𝐈𝐎 𝐅𝟏*\n├✯\n│\n${lista}\n│\n┗═•❃༺🏎️༻❃•═┛`);
            return;
        }

        if (['classificacao', 'classificação', 'ranking', 'pilotos'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/driverstandings/?limit=20'));
            const standings = dados?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
            if (!standings.length) throw new Error('Classificação vazia.');
            const lista = standings.slice(0, 20).map(item => `├➤ *${item.position || '?'}º* ${limparTextoAPI(`${item.Driver?.givenName || ''} ${item.Driver?.familyName || ''}`)} • *${item.points || 0} pts*\n│   🏎️ ${limparTextoAPI(item.Constructors?.[0]?.name || 'N/A')}`).join('\n│\n');
            await reagir(message, '🏆');
            await responderCitando(message, `┏═•❃༺🏆༻❃•═┓\n│      *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀𝐂̧𝐀̃𝐎 𝐅𝟏*\n├✯\n│\n${lista}\n│\n┗═•❃༺🏆༻❃•═┛`);
            return;
        }

        await reagir(message, '❌');
        await responderCitando(message, `❌ _Opção de F1 não reconhecida._\n\nUse:\n*${PREFIXO}f1*\n*${PREFIXO}f1 calendario*\n*${PREFIXO}f1 classificacao*`);
    } catch (erro) {
        console.error('❌ Erro na API de F1:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui consultar os dados da Fórmula 1 agora. Tente novamente em alguns segundos._');
    }
}

async function comandoQualidadeAr(message, argumentos) {
    const cidade = String(argumentos || '').trim();
    if (!cidade) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe uma cidade._\n\nExemplo: *${PREFIXO}ar São Paulo*`);
        return;
    }

    try {
        const geo = await buscarJsonAPI(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`);
        const local = geo?.results?.[0];
        if (!local) throw new Error('Cidade não encontrada.');

        const dados = await buscarJsonAPI(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${local.latitude}&longitude=${local.longitude}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`);
        const atual = dados?.current || {};
        const aqi = atual.european_aqi;
        const classificacao = aqi === undefined || aqi === null ? 'N/A' : aqi <= 20 ? '🟢 Boa' : aqi <= 40 ? '🟡 Razoável' : aqi <= 60 ? '🟠 Moderada' : aqi <= 80 ? '🔴 Ruim' : aqi <= 100 ? '🟣 Muito ruim' : '⚫ Extremamente ruim';

        await reagir(message, '🌫️');
        await responderCitando(message, `┏═•❃༺🌫️༻❃•═┓\n│    *𝐐𝐔𝐀𝐋𝐈𝐃𝐀𝐃𝐄 𝐃𝐎 𝐀𝐑*\n├✯\n│\n├➤ 📍 *${limparTextoAPI(local.name)}, ${limparTextoAPI(local.country || '')}*\n├➤ 🌫️ AQI europeu: *${aqi ?? 'N/A'}*\n├➤ 📊 Classificação: *${classificacao}*\n│\n├➤ 💨 PM2.5: *${atual.pm2_5 ?? 'N/A'} µg/m³*\n├➤ 💨 PM10: *${atual.pm10 ?? 'N/A'} µg/m³*\n├➤ 🧪 NO₂: *${atual.nitrogen_dioxide ?? 'N/A'} µg/m³*\n├➤ 🧪 O₃: *${atual.ozone ?? 'N/A'} µg/m³*\n├➤ 🧪 SO₂: *${atual.sulphur_dioxide ?? 'N/A'} µg/m³*\n│\n┗═•❃༺🌫️༻❃•═┛`);
    } catch (erro) {
        console.error('❌ Erro na API de qualidade do ar:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Não consegui consultar a qualidade do ar de_ *${cidade}* _agora._`);
    }
}

// ============================================================
// QUIZ
// ============================================================

async function iniciarQuiz(message) {
    return comandoQuizAPI(message);
}

async function responderQuiz(
    message,
    argumento
) {
    const pergunta =
        quizzes.get(
            message.from
        );

    if (!pergunta) {
        await responderCitando(
            message,
            `❌ *𝐍𝐄𝐍𝐇𝐔𝐌𝐀 𝐏𝐄𝐑𝐆𝐔𝐍𝐓𝐀 𝐀𝐓𝐈𝐕𝐀.*

_Digite:_
*${PREFIXO}quiz*`
        );

        return;
    }

    const resposta =
        argumento
            .toLowerCase()
            .trim();

    if (
        !['a', 'b', 'c', 'd']
            .includes(resposta)
    ) {
        await responderCitando(
            message,
            '❌ _Responda apenas com A, B, C ou D._'
        );

        return;
    }

    quizzes.delete(
        message.from
    );

    if (
        resposta ===
        pergunta.resposta
    ) {
        await reagir(
            message,
            '🎉'
        );

        await responderCitando(
            message,
            '🎉 *𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 𝐂𝐎𝐑𝐑𝐄𝐓𝐀!*'
        );

    } else {
        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 𝐄𝐑𝐑𝐀𝐃𝐀!*

_A resposta correta era:_
*${pergunta.resposta.toUpperCase()}*`
        );
    }
}


// ============================================================
// PING
// ============================================================

async function ping(message) {
    await reagir(message, '🏓');

    await responderCitando(
        message,
        `🏓 *𝐏𝐎𝐍𝐆!*

*🤖 ${NOME_BOT}*
_Online e funcionando!_`
    );
}


// ============================================================
// HORA
// ============================================================

async function mostrarHora(message) {
    const agora =
        new Date();

    const hora =
        agora.toLocaleTimeString(
            'pt-BR',
            {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        );

    await reagir(message, '🕐');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
├✯ *🕐 𝐇𝐎𝐑𝐀*
│
├➤ *${hora}*
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// INFO
// ============================================================

async function mostrarInfo(message) {
    await reagir(message, 'ℹ️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *ℹ️ 𝐈𝐍𝐅𝐎*
├✯
├➤ *🤖 𝐁𝐎𝐓:* ${NOME_BOT}
├➤ *📦 𝐕𝐄𝐑𝐒𝐀̃𝐎:* ${VERSAO}
├➤ *🟢 𝐒𝐓𝐀𝐓𝐔𝐒:* Online
├➤ *⚙️ 𝐓𝐄𝐂𝐍𝐎𝐋𝐎𝐆𝐈𝐀:* Node.js
│
┗═•❃༺✿༻❃•═┛`
    );
}

// ============================================================
// 🖼️ OBTER FOTO DE PERFIL DIRETAMENTE DO WHATSAPP WEB
// ============================================================

async function obterFotoPerfilDireta(idPessoa) {

    try {

        if (!idPessoa) {
            return null;
        }

        const resultado =
            await client.pupPage.evaluate(
                async (contactId) => {

                    try {

                        // ====================================================
                        // CRIAR O WID DIRETAMENTE
                        // ====================================================

                        const WidFactory =
                            window.require(
                                'WAWebWidFactory'
                            );

                        const wid =
                            WidFactory.createWid(
                                contactId
                            );

                        if (!wid) {
                            return {
                                sucesso: false,
                                erro: 'Não foi possível criar o WID.'
                            };
                        }

                        // ====================================================
                        // LOCALIZAR O CHAT CORRETO
                        // ====================================================

                        const FindChatAction =
                            window.require(
                                'WAWebFindChatAction'
                            );

                        const resultadoChat =
                            await FindChatAction
                                .findOrCreateLatestChat(
                                    wid
                                );

                        const chat =
                            resultadoChat?.chat ||
                            resultadoChat;

                        if (!chat) {

                            return {
                                sucesso: false,
                                erro: 'Chat não encontrado.'
                            };
                        }

                        // ====================================================
                        // OBTER FOTO
                        // ====================================================

                        const ProfilePicBridge =
                            window.require(
                                'WAWebContactProfilePicThumbBridge'
                            );

                        const foto =
                            await ProfilePicBridge
                                .requestProfilePicFromServer(
                                    chat
                                );

                        if (!foto) {

                            return {
                                sucesso: false,
                                erro: 'WhatsApp não retornou uma foto.'
                            };
                        }

                        // ====================================================
                        // DEVOLVER URL
                        // ====================================================

                        return {
                            sucesso: true,
                            url:
                                foto.eurl ||
                                foto.url ||
                                null
                        };

                    } catch (erro) {

                        return {
                            sucesso: false,
                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )
                        };
                    }
                },
                idPessoa
            );

        console.log(
            '🖼️ RESULTADO FOTO DIRETA:',
            resultado
        );

        if (
            !resultado ||
            !resultado.sucesso ||
            !resultado.url
        ) {

            return null;
        }

        return resultado.url;

    } catch (erro) {

        console.error(
            '❌ Erro ao obter foto diretamente:',
            erro
        );

        return null;
    }
}

// ============================================================
// 👤 MOSTRAR PERFIL
// ============================================================

async function mostrarPerfil(message) {

    try {

        // ========================================================
        // 1. DESCOBRIR DE QUEM É O PERFIL
        // ========================================================

        let pessoa = null;
        let idPessoa = null;

        const mencoes =
            await message.getMentions();

        if (
            mencoes &&
            mencoes.length > 0
        ) {

            pessoa =
                mencoes[0];

            idPessoa =
                idDaPessoa(
                    pessoa
                );
        }

        // ========================================================
        // 2. TENTAR PELA MENSAGEM RESPONDIDA
        // ========================================================

        if (
            !idPessoa &&
            message.hasQuotedMsg
        ) {

            try {

                const mensagemAlvo =
                    await message.getQuotedMessage();

                if (mensagemAlvo) {

                    idPessoa =
                        mensagemAlvo.author ||
                        mensagemAlvo.from ||
                        null;
                }

            } catch (erro) {

                console.log(
                    '⚠️ Erro ao obter pessoa respondida:',
                    erro.message
                );
            }
        }

        // ========================================================
        // 3. SE NÃO INFORMOU NINGUÉM, MOSTRAR O PRÓPRIO PERFIL
        // ========================================================

        if (!idPessoa) {

            idPessoa =
                obterIdRemetente(
                    message
                );
        }

        if (!idPessoa) {

            await reagir(
                message,
                '❌'
            );

            return;
        }

        // ========================================================
        // 4. PEGAR OS DADOS DO XP
        // ========================================================

        const dados =
            garantirDadosXP(
                message.from,
                idPessoa
            );

        // ========================================================
        // 5. CALCULAR PROGRESSO PARA O PRÓXIMO NÍVEL
        // ========================================================

        const nivelAtual =
            dados.nivel;

        const xpAtual =
            dados.xp;

        const proximoNivel =
            nivelAtual + 1;

        const xpProximoNivel =
            Math.pow(
                proximoNivel - 1,
                2
            ) * 100;

        const xpNivelAtual =
            Math.pow(
                nivelAtual - 1,
                2
            ) * 100;

        const xpNecessario =
            xpProximoNivel -
            xpNivelAtual;

        const xpNoNivel =
            xpAtual -
            xpNivelAtual;

        const xpRestante =
            Math.max(
                0,
                xpProximoNivel - xpAtual
            );

        // ========================================================
        // 6. BARRA DE PROGRESSO
        // ========================================================

        const progresso =
            Math.min(
                1,
                Math.max(
                    0,
                    xpNoNivel /
                    xpNecessario
                )
            );

        const totalBlocos = 10;

        const blocosCheios =
            Math.floor(
                progresso *
                totalBlocos
            );

        const barraXP =
            '▰'.repeat(
                blocosCheios
            ) +
            '▱'.repeat(
                totalBlocos -
                blocosCheios
            );

        // ========================================================
        // 7. CRIAR MENÇÃO
        // ========================================================

        const mencao =
            `@${String(idPessoa).split('@')[0]}`;

// ========================================================
// 8. PEGAR FOTO DE PERFIL
// ========================================================

let imagemPerfil = null;

try {

    const urlFoto =
        await obterFotoPerfilDireta(
            idPessoa
        );

    if (urlFoto) {

        try {

            imagemPerfil =
                await MessageMedia.fromUrl(
                    urlFoto
                );

            console.log(
                '✅ Foto de perfil carregada!'
            );

        } catch (erroDownload) {

            console.log(
                '⚠️ Não foi possível baixar a foto:',
                erroDownload.message
            );
        }

    } else {

        console.log(
            'ℹ️ Nenhuma foto de perfil disponível.'
        );
    }

} catch (erroFoto) {

    console.log(
        '⚠️ Erro ao obter foto de perfil:',
        erroFoto.message
    );
}

        // ========================================================
        // 9. MONTAR PERFIL
        // ========================================================

        const textoPerfil =
`┏═•❃༺👤༻❃•═┓
│   *👤 𝐏𝐄𝐑𝐅𝐈𝐋*
├✯
├➤ ${mencao}
│
├➤ ⭐ *𝐍𝐈́𝐕𝐄𝐋*
│   ➜ *Nível ${dados.nivel}*
│
├➤ ✨ *𝐗𝐏 𝐀𝐓𝐔𝐀𝐋*
│   ➜ *${dados.xp} XP*
│
├➤ 💬 *𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐍𝐒*
│   ➜ *${dados.mensagens}*
│
├➤ 📈 *𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐒𝐎*
│   ➜ ${barraXP}
│
├➤ 🎯 *𝐏𝐑Ó𝐗𝐈𝐌𝐎 𝐍𝐈́𝐕𝐄𝐋*
│   ➜ *${xpRestante} XP restantes*
│
┗═•❃༺👤༻❃•═┛`;

        // ========================================================
        // 10. ENVIAR RESPONDENDO À MENSAGEM
        // ========================================================

        await reagir(
            message,
            '👤'
        );

        const opcoesEnvio = {
            caption: textoPerfil,

            mentions: [
                idPessoa
            ],

            quotedMessageId:
                message.id._serialized
        };

        // ========================================================
        // 11. ENVIAR COM FOTO OU SEM FOTO
        // ========================================================

        if (imagemPerfil) {

            await enviarComMencoes(
                message.from,
                imagemPerfil,
                opcoesEnvio
            );

        } else {

            await enviarComMencoes(
                message.from,
                textoPerfil,
                {
                    mentions: [
                        idPessoa
                    ],

                    quotedMessageId:
                        message.id._serialized
                }
            );
        }

    } catch (erro) {

        console.error(
            '❌ Erro ao mostrar perfil:',
            erro
        );

        await reagir(
            message,
            '❌'
        );
    }
}

// ============================================================
// 🏆 MOSTRAR RANKING DE XP
// ============================================================

async function mostrarRanking(message) {

    try {

        // ========================================================
        // 1. VERIFICAR SE ESTÁ EM GRUPO
        // ========================================================

        if (
            !message.from ||
            !message.from.endsWith('@g.us')
        ) {

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `┏═•❃༺🏆༻❃•═┓
│   *🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐗𝐏*
├✯
│
├➤ ❌ Este comando só pode
│   ser usado em grupos.
│
┗═•❃༺🏆༻❃•═┛`
            );

            return;
        }

        // ========================================================
        // 2. PEGAR DADOS DO GRUPO
        // ========================================================

        const grupoXP =
            dadosXP.get(
                message.from
            );

        if (
            !grupoXP ||
            grupoXP.size === 0
        ) {

            await reagir(
                message,
                '📊'
            );

            await responderCitando(
                message,
                `┏═•❃༺🏆༻❃•═┓
│   *🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐗𝐏*
├✯
│
├➤ 📊 Ainda não existem
│   jogadores no ranking.
│
├➤ _Comecem a conversar
│   para ganhar XP!_ ⭐
│
┗═•❃༺🏆༻❃•═┛`
            );

            return;
        }

        // ========================================================
        // 3. TRANSFORMAR MAP EM ARRAY
        // ========================================================

        const jogadores =
            [...grupoXP.entries()]
                .map(
                    (
                        [
                            usuarioId,
                            dados
                        ]
                    ) => ({

                        id:
                            usuarioId,

                        xp:
                            Number(
                                dados.xp
                            ) || 0,

                        mensagens:
                            Number(
                                dados.mensagens
                            ) || 0,

                        nivel:
                            Number(
                                dados.nivel
                            ) ||
                            calcularNivel(
                                Number(
                                    dados.xp
                                ) || 0
                            )

                    })
                );

        // ========================================================
        // 4. ORDENAR
        // ========================================================
        //
        // Primeiro XP.
        // Em caso de empate, mensagens.
        // Se ainda empatar, mantém uma ordem estável pelo ID.
        // ========================================================

        jogadores.sort(
            (a, b) => {

                if (
                    b.xp !==
                    a.xp
                ) {

                    return (
                        b.xp -
                        a.xp
                    );
                }

                if (
                    b.mensagens !==
                    a.mensagens
                ) {

                    return (
                        b.mensagens -
                        a.mensagens
                    );
                }

                return String(
                    a.id
                ).localeCompare(
                    String(
                        b.id
                    )
                );
            }
        );

        // ========================================================
        // 5. ENCONTRAR POSIÇÃO DO USUÁRIO
        // ========================================================

        const idRemetente =
            obterIdRemetente(
                message
            );

        const posicaoUsuario =
            jogadores.findIndex(
                jogador =>
                    idsIguais(
                        jogador.id,
                        idRemetente
                    )
            );

        // ========================================================
        // 6. TOP 10
        // ========================================================

        const top10 =
            jogadores.slice(
                0,
                10
            );

        const medalhas = [
            '🥇',
            '🥈',
            '🥉'
        ];

        let textoRanking =
            `┏═•❃༺🏆༻❃•═┓
│   *🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐗𝐏*
├✯
│
`;

        const idsMencao = [];

        for (
            let i = 0;
            i < top10.length;
            i++
        ) {

            const jogador =
                top10[i];

            const posicao =
                i + 1;

            const emojiPosicao =
                medalhas[i] ||
                `${posicao}️⃣`;

            const mencao =
                `@${String(
                    jogador.id
                ).split('@')[0]}`;

            idsMencao.push(
                jogador.id
            );

            textoRanking +=
                `├➤ ${emojiPosicao} *${posicao}º* ${mencao}
│   ⭐ Nível *${jogador.nivel}* • *${jogador.xp} XP*
│   💬 ${jogador.mensagens} mensagem${jogador.mensagens === 1 ? '' : 'ns'}
│
`;
        }

        textoRanking +=
            `└──────────────────`;

        // ========================================================
        // 7. MOSTRAR POSIÇÃO DO USUÁRIO
        // ========================================================

        if (
            posicaoUsuario !== -1
        ) {

            const jogadorUsuario =
                jogadores[
                    posicaoUsuario
                ];

            const posicao =
                posicaoUsuario + 1;

            textoRanking +=
                `

👤 *SUA POSIÇÃO*

➜ *${posicao}º lugar*
⭐ Nível *${jogadorUsuario.nivel}*
✨ *${jogadorUsuario.xp} XP*
💬 *${jogadorUsuario.mensagens} mensagens*`;
        }

        textoRanking +=
            `

┗═•❃༺🏆༻❃•═┛`;

        // ========================================================
        // 8. ENVIAR
        // ========================================================

        await reagir(
            message,
            '🏆'
        );

        await responderCitando(
            message,
            textoRanking,
            {
                mentions:
                    idsMencao
            }
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao mostrar ranking:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Ocorreu um erro ao carregar o ranking de XP._'
        );
    }
}

// ============================================================
// ============================================================
// 👶 MOSTRAR RANKING DE FILHOS
// ============================================================

async function mostrarRankingFilhos(message) {

    try {

        if (
            !message.from ||
            !message.from.endsWith('@g.us')
        ) {

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `┏═•❃༺👶༻❃•═┓
│   *👶 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐅𝐈𝐋𝐇𝐎𝐒*
├✯
│
├➤ ❌ Este comando só pode
│   ser usado em grupos.
│
┗═•❃༺👶༻❃•═┛`
            );

            return;
        }

        const grupoXP =
            dadosXP.get(
                message.from
            );

        if (
            !grupoXP ||
            grupoXP.size === 0
        ) {

            await reagir(
                message,
                '📊'
            );

            await responderCitando(
                message,
                `┏═•❃༺👶༻❃•═┓
│   *👶 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐅𝐈𝐋𝐇𝐎𝐒*
├✯
│
├➤ 📊 Ainda não existem
│   dados de XP neste grupo.
│
├➤ _Conversem para começar a
│   ganhar XP!_ ⭐
│
┗═•❃༺👶༻❃•═┛`
            );

            return;
        }

        const idsFilhos = new Set();

        for (
            const familia of familias.values()
        ) {

            if (
                !familia ||
                !Array.isArray(
                    familia.filhos
                )
            ) {
                continue;
            }

            for (
                const idFilho of familia.filhos
            ) {

                if (idFilho) {
                    idsFilhos.add(
                        String(idFilho)
                    );
                }
            }
        }

        const filhos =
            [...grupoXP.entries()]
                .filter(
                    ([usuarioId]) =>
                        [...idsFilhos].some(
                            idFilho =>
                                idsIguais(
                                    idFilho,
                                    usuarioId
                                )
                        )
                )
                .map(
                    ([usuarioId, dados]) => ({

                        id:
                            usuarioId,

                        xp:
                            Number(
                                dados.xp
                            ) || 0,

                        mensagens:
                            Number(
                                dados.mensagens
                            ) || 0,

                        nivel:
                            Number(
                                dados.nivel
                            ) ||
                            calcularNivel(
                                Number(
                                    dados.xp
                                ) || 0
                            )
                    })
                );

        if (
            filhos.length === 0
        ) {

            await reagir(
                message,
                '👶'
            );

            await responderCitando(
                message,
                `┏═•❃༺👶༻❃•═┓
│   *👶 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐅𝐈𝐋𝐇𝐎𝐒*
├✯
│
├➤ 👶 Nenhum filho com XP
│   foi encontrado neste grupo.
│
├➤ _Adote alguém e participe
│   das conversas para aparecer!_ ⭐
│
┗═•❃༺👶༻❃•═┛`
            );

            return;
        }

        filhos.sort(
            (a, b) => {

                if (
                    b.xp !==
                    a.xp
                ) {
                    return b.xp - a.xp;
                }

                if (
                    b.mensagens !==
                    a.mensagens
                ) {
                    return b.mensagens - a.mensagens;
                }

                return String(
                    a.id
                ).localeCompare(
                    String(b.id)
                );
            }
        );

        const top10 =
            filhos.slice(
                0,
                10
            );

        const medalhas = [
            '🥇',
            '🥈',
            '🥉'
        ];

        let textoRanking =
            `┏═•❃༺👶༻❃•═┓
│   *👶 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐅𝐈𝐋𝐇𝐎𝐒*
├✯
│
`;

        const idsMencao = [];

        for (
            let i = 0;
            i < top10.length;
            i++
        ) {

            const filho =
                top10[i];

            const posicao =
                i + 1;

            const emojiPosicao =
                medalhas[i] ||
                `${posicao}️⃣`;

            const mencao =
                `@${String(
                    filho.id
                ).split('@')[0]}`;

            idsMencao.push(
                filho.id
            );

            textoRanking +=
                `├➤ ${emojiPosicao} *${posicao}º* ${mencao}
│   ⭐ Nível *${filho.nivel}* • *${filho.xp} XP*
│   💬 ${filho.mensagens} mensagem${filho.mensagens === 1 ? '' : 'ns'}
│
`;
        }

        textoRanking +=
            `└──────────────────`;

        textoRanking +=
            `

👶 *Total de filhos no ranking:* ${filhos.length}`;

        textoRanking +=
            `

┗═•❃༺👶༻❃•═┛`;

        await reagir(
            message,
            '👶'
        );

        await responderCitando(
            message,
            textoRanking,
            {
                mentions:
                    idsMencao
            }
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao mostrar ranking de filhos:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Ocorreu um erro ao carregar o ranking de filhos._'
        );
    }
}

// 🎖️ MOSTRAR CONQUISTAS
// ============================================================

async function mostrarConquistas(
    message
) {

    try {

        const usuarioId =
            obterIdRemetente(
                message
            );

        if (!usuarioId) {

            await reagir(
                message,
                '❌'
            );

            return;
        }

        const conquistasDesbloqueadas =
            garantirConquistasUsuario(
                usuarioId
            );

        const listaConquistas =
            Object.entries(
                CONQUISTAS
            );

        let texto =
            `┏═•❃༺🎖️༻❃•═┓
│   *🎖️ 𝐒𝐔𝐀𝐒 𝐂𝐎𝐍𝐐𝐔𝐈𝐒𝐓𝐀𝐒*
├✯
│
`;

        let desbloqueadas = 0;

        for (
            const [
                id,
                conquista
            ] of listaConquistas
        ) {

            if (
                conquistasDesbloqueadas.has(
                    id
                )
            ) {

                desbloqueadas++;

                texto +=
                    `├➤ ${conquista.emoji} *${conquista.nome}* ✅
│   _${conquista.descricao}_
│
`;
            }
        }

        if (
            desbloqueadas === 0
        ) {

            texto +=
                `├➤ 🔒 _Você ainda não desbloqueou
│   nenhuma conquista._
│
`;
        }

        texto +=
            `├──────────────────
│
│ *🔒 CONQUISTAS BLOQUEADAS*
│
`;

        let bloqueadas = 0;

        for (
            const [
                id,
                conquista
            ] of listaConquistas
        ) {

            if (
                !conquistasDesbloqueadas.has(
                    id
                )
            ) {

                bloqueadas++;

                texto +=
                    `├➤ 🔒 ${conquista.emoji} *${conquista.nome}*
│   _${conquista.descricao}_
│
`;
            }
        }

        if (
            bloqueadas === 0
        ) {

            texto +=
                `├➤ 🏆 _Todas as conquistas foram desbloqueadas!_
│
`;
        }

        texto +=
            `├──────────────────
│
│ 🎖️ *${desbloqueadas}/${listaConquistas.length}*
│   conquistas desbloqueadas.
│
┗═•❃༺🎖️༻❃•═┛`;

        await reagir(
            message,
            '🎖️'
        );

        await responderCitando(
            message,
            texto
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao mostrar conquistas:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Ocorreu um erro ao carregar suas conquistas._'
        );
    }
}

// ============================================================
// FIGURINHA
// ============================================================

async function criarFigurinha(message) {

    let mensagemAlvo =
        message;

    if (message.hasQuotedMsg) {
        try {
            mensagemAlvo =
                await message.getQuotedMessage();

        } catch (erro) {
            console.log(
                '⚠️ Não foi possível obter a mensagem citada.'
            );
        }
    }

    if (!mensagemAlvo.hasMedia) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐈𝐌𝐀𝐆𝐄𝐌 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀.*

_Envie uma imagem ou responda a uma imagem com:_

*${PREFIXO}fig*`
        );

        return;
    }

    try {
        const midia =
            await mensagemAlvo.downloadMedia();

        if (!midia) {
            throw new Error(
                'Mídia não disponível.'
            );
        }

        const figurinha =
            new MessageMedia(
                midia.mimetype,
                midia.data,
                midia.filename ||
                'figurinha'
            );

        await client.sendMessage(
            message.from,
            figurinha,
            {
                sendMediaAsSticker: true
            }
        );

        await reagir(
            message,
            '✅'
        );

    } catch (erro) {
        console.error(
            '❌ Erro ao criar figurinha:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐍𝐀̃𝐎 𝐅𝐎𝐈 𝐏𝐎𝐒𝐒𝐈́𝐕𝐄𝐋 𝐂𝐑𝐈𝐀𝐑 𝐀 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀.*

_Se for uma imagem de visualização única,_
_o WhatsApp pode não disponibilizar a mídia_
_para o bot.`
        );
    }
}


// ============================================================
// EMOJI MIX
// ============================================================

async function combinarEmojis(
    message,
    argumento
) {
    const emojis =
        Array.from(argumento.trim())
            .filter(
                caractere =>
                    caractere.trim().length > 0
            );

    if (emojis.length < 2) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐄𝐌𝐎𝐉𝐈𝐒 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎𝐒.*

_Envie dois emojis separados por espaço:_

*${PREFIXO}emojimix 😀 😂*`
        );

        return;
    }

    const [emojiUm, emojiDois] = emojis;

    try {
        const url =
            `https://emojik.vercel.app/s/${encodeURIComponent(emojiUm)}_${encodeURIComponent(emojiDois)}?size=1024`;

        const resposta =
            await fetch(url);

        if (!resposta.ok) {
            throw new Error(
                'Combinação não encontrada.'
            );
        }

        const bytes =
            await resposta.arrayBuffer();

        const base64 =
            Buffer
                .from(bytes)
                .toString('base64');

        const figurinha =
            new MessageMedia(
                'image/png',
                base64,
                'emojimix.png'
            );

        await client.sendMessage(
            message.from,
            figurinha,
            {
                sendMediaAsSticker: true
            }
        );

        await reagir(message, '✅');

    } catch (erro) {
        console.error(
            '❌ Erro ao combinar emojis:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐍𝐀̃𝐎 𝐅𝐎𝐈 𝐏𝐎𝐒𝐒𝐈́𝐕𝐄𝐋 𝐂𝐎𝐌𝐁𝐈𝐍𝐀𝐑.*

_Essa combinação pode não existir no_
_Emoji Kitchen. Tente outra dupla._`
        );
    }
}

// ============================================================
// BRAT
// ============================================================

function escaparXmlBrat(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function quebrarTextoBrat(texto, caracteresPorLinha) {
    const palavras = texto
        .trim()
        .split(/\s+/);

    const linhas = [];
    let linhaAtual = '';

    for (const palavra of palavras) {

        const tentativa =
            linhaAtual
                ? `${linhaAtual} ${palavra}`
                : palavra;

        if (
            tentativa.length >
            caracteresPorLinha
        ) {
            if (linhaAtual) {
                linhas.push(linhaAtual);
            }

            linhaAtual = palavra;

        } else {
            linhaAtual = tentativa;
        }
    }

    if (linhaAtual) {
        linhas.push(linhaAtual);
    }

    return linhas;
}


// Calcula automaticamente o tamanho da fonte
// para aproveitar melhor a imagem.

function calcularLayoutBrat(texto) {

    const tamanho = 1000;

    // Caixa onde o texto pode ocupar
    const margemEsquerda = 75;
    const margemDireita = 55;
    const margemSuperior = 55;
    const margemInferior = 55;

    const larguraUtil =
        tamanho -
        margemEsquerda -
        margemDireita;

    const alturaUtil =
        tamanho -
        margemSuperior -
        margemInferior;

    // Começa grande e vai diminuindo
    let fonte = 250;

    while (fonte >= 35) {

        /*
         * Quanto menor a fonte,
         * mais apertadas ficam as letras.
         */
        const proporcao =
            (fonte - 35) /
            (210 - 35);

        const letterSpacing =
            -2.0 -
            ((1 - proporcao) * 3.0);

        /*
         * Estimativa da largura média de uma letra.
         * Será usada apenas para uma primeira aproximação.
         */
        const larguraMediaLetra =
            fonte * 0.50;

        /*
         * Converte o texto em palavras.
         */
        const palavras =
            texto
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        const linhas = [];

        let linhaAtual = '';

        /*
         * Aproximação da largura de uma palavra.
         *
         * O letter-spacing entra no cálculo,
         * fazendo o texto realmente ficar mais comprimido
         * quando a fonte diminui.
         */
        function medirTexto(textoMedido) {

            if (!textoMedido) {
                return 0;
            }

            const caracteres =
                textoMedido.length;

            return (
                caracteres *
                larguraMediaLetra
            ) +
            (
                Math.max(
                    0,
                    caracteres - 1
                ) *
                letterSpacing
            );
        }

        /*
         * Coloca palavra por palavra.
         */
        for (
            const palavra of palavras
        ) {

            const tentativa =
                linhaAtual
                    ? `${linhaAtual} ${palavra}`
                    : palavra;

            const largura =
                medirTexto(
                    tentativa
                );

            if (
                !linhaAtual ||
                largura <= larguraUtil
            ) {

                linhaAtual =
                    tentativa;

            } else {

                linhas.push(
                    linhaAtual
                );

                linhaAtual =
                    palavra;
            }
        }

        /*
         * Adiciona a última linha.
         */
        if (linhaAtual) {

            linhas.push(
                linhaAtual
            );
        }

        /*
         * Espaçamento vertical.
         *
         * Conforme a fonte diminui,
         * as linhas também ficam mais próximas.
         */
        const alturaLinha =
            fonte *
            (
                0.92 -
                ((1 - proporcao) * 0.12)
            );

        const alturaTotal =
            linhas.length *
            alturaLinha;

        /*
         * Se couber na caixa,
         * encontramos o tamanho ideal.
         */
        if (
            alturaTotal <=
            alturaUtil
        ) {

            return {

                fonte,

                linhas,

                alturaLinha,

                letterSpacing,

                margemEsquerda

            };
        }

        /*
         * Não coube?
         * Diminui a fonte e tenta novamente.
         */
        fonte -= 4;
    }

    /*
     * Segurança caso seja texto gigantesco.
     */
    const fonteFinal = 35;

    const palavras =
        texto
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    const letterSpacing = -5;

    const larguraMediaLetra =
        fonteFinal * 0.50;

    const linhas = [];

    let linhaAtual = '';

    function medirTextoFinal(
        textoMedido
    ) {

        if (!textoMedido) {
            return 0;
        }

        const caracteres =
            textoMedido.length;

        return (
            caracteres *
            larguraMediaLetra
        ) +
        (
            Math.max(
                0,
                caracteres - 1
            ) *
            letterSpacing
        );
    }

    for (
        const palavra of palavras
    ) {

        const tentativa =
            linhaAtual
                ? `${linhaAtual} ${palavra}`
                : palavra;

        if (
            !linhaAtual ||
            medirTextoFinal(
                tentativa
            ) <= larguraUtil
        ) {

            linhaAtual =
                tentativa;

        } else {

            linhas.push(
                linhaAtual
            );

            linhaAtual =
                palavra;
        }
    }

    if (linhaAtual) {

        linhas.push(
            linhaAtual
        );
    }

    return {

        fonte: fonteFinal,

        linhas,

        alturaLinha:
            fonteFinal * 0.80,

        letterSpacing,

        margemEsquerda

    };
}


// ============================================================
// SVG BRAT
// ============================================================

function construirSvgBrat(
    layout,
    opcoes = {}
) {

    const tamanho = 1000;

    const desfoque =
        opcoes.desfoque ?? 2.8;

    const escalaX =
        opcoes.escalaX ?? 1.0;

    const deslocamentoX =
        opcoes.deslocamentoX ?? 0;

    const deslocamentoY =
        opcoes.deslocamentoY ?? 0;

    const {
        fonte,
        linhas,
        alturaLinha,
        letterSpacing,
        margemEsquerda
    } = layout;

    const alturaTotal =
        linhas.length *
        alturaLinha;

    /*
     * Centraliza verticalmente,
     * mas mantém o texto preso à esquerda.
     */
    const yInicial =
        (tamanho / 2) -
        (alturaTotal / 2) +
        (alturaLinha * 0.78) +
        deslocamentoY;

    const linhasSvg =
        linhas
            .map(
                (
                    linha,
                    indice
                ) => {

                    const y =
                        yInicial +
                        indice *
                        alturaLinha;

                    return `
<tspan
    x="${margemEsquerda}"
    y="${y}"
>${escaparXmlBrat(linha)}</tspan>`;
                }
            )
            .join('');

    return `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${tamanho}"
    height="${tamanho}"
    viewBox="0 0 ${tamanho} ${tamanho}"
>

    <defs>

        <filter
            id="bratBlur"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
        >

            <feGaussianBlur
                stdDeviation="${desfoque}"
            />

        </filter>

    </defs>

    <!-- Fundo branco -->

    <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#ffffff"
    />

    <g
        transform="
            translate(${deslocamentoX}, 0)
            scale(${escalaX}, 1)
        "
    >

        <text
            x="${margemEsquerda}"
            y="0"
            font-family="Arial Narrow, Liberation Sans Narrow, Arial, Helvetica, sans-serif"
            font-size="${fonte}"
            font-weight="400"
            letter-spacing="${letterSpacing}"
            fill="#000000"
            filter="url(#bratBlur)"
        >

            ${linhasSvg}

        </text>

    </g>

</svg>`;
}


// ============================================================
// BRAT 1
// ============================================================

async function gerarBrat1(
    message,
    argumento
) {

    const texto =
    (argumento || '')
        .trim()
        .toLowerCase();

    if (!texto) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐓𝐄𝐗𝐓𝐎 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_

*${PREFIXO}brat1 ola a todos*`
        );

        return;
    }

    try {

        const layout =
            calcularLayoutBrat(
                texto
            );

        const svg =
            construirSvgBrat(
                layout,
                {
                    desfoque: 7,
                    escalaX: 1.0
                }
            );

        const buffer =
            await sharp(
                Buffer.from(svg)
            )
                .png({
                    compressionLevel: 6,
                    quality: 50
                })
                .toBuffer();

        const figurinha =
            new MessageMedia(
                'image/png',
                buffer.toString('base64'),
                'brat.png'
            );

        await client.sendMessage(
            message.from,
            figurinha,
            {
                sendMediaAsSticker: true
            }
        );

        await reagir(
            message,
            '✅'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao gerar brat1:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Não foi possível gerar a figurinha brat._'
        );
    }
}


// ============================================================
// BRAT 2
// ANIMAÇÃO PALAVRA POR PALAVRA
// ============================================================

async function gerarBrat2(
    message,
    argumento
) {

    const texto =
    (argumento || '')
        .trim()
        .toLowerCase();

    if (!texto) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐓𝐄𝐗𝐓𝐎 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_

*${PREFIXO}brat2 ola a todos*`
        );

        return;
    }

    try {

        // ====================================================
        // PALAVRAS
        // ====================================================

        const palavras =
            texto
                .split(/\s+/)
                .filter(Boolean);

        // ====================================================
        // LAYOUT COMPLETO
        // ====================================================

        const layoutCompleto =
            calcularLayoutBrat(
                texto
            );

        /*
         * Mantém a mesma quantidade de caracteres
         * por linha durante toda a animação.
         */
        const caracteresPorLinha =
            Math.max(
                3,
                Math.floor(
                    layoutCompleto.larguraUtil /
                    (
                        layoutCompleto.fonte *
                        0.48
                    )
                )
            );

        // ====================================================
        // FRAMES
        // ====================================================

        const frames = [];

        /*
         * Primeiro frame vazio.
         */
        frames.push([]);

        /*
         * Uma palavra por vez.
         */
        for (
            let i = 1;
            i <= palavras.length;
            i++
        ) {

            frames.push(
                palavras.slice(
                    0,
                    i
                )
            );
        }

        // ====================================================
        // GIF
        // ====================================================

        const encoder =
            new GIFEncoder(
                1000,
                1000
            );

        encoder.start();

        encoder.setRepeat(0);

        /*
         * Qualidade propositalmente mais baixa.
         *
         * Isso ajuda a chegar naquela aparência
         * "estourada" do Brat Generator.
         */
        encoder.setQuality(5);

        // ====================================================
        // FRAMES
        // ====================================================

        for (
            let i = 0;
            i < frames.length;
            i++
        ) {

            const palavrasVisiveis =
                frames[i];

            let linhas;

            // -----------------------------------------------
            // FRAME VAZIO
            // -----------------------------------------------

            if (
                palavrasVisiveis.length === 0
            ) {

                linhas = [' '];

            } else {

                const textoFrame =
                    palavrasVisiveis.join(' ');

                linhas =
                    quebrarTextoBrat(
                        textoFrame,
                        caracteresPorLinha
                    );
            }

            const layoutFrame = {

                fonte:
                    layoutCompleto.fonte,

                linhas,

                alturaLinha:
                    layoutCompleto.alturaLinha,

                margemEsquerda:
                    layoutCompleto.margemEsquerda,

                margemDireita:
                    layoutCompleto.margemDireita,

                larguraUtil:
                    layoutCompleto.larguraUtil
            };

            // =================================================
            // SVG
            // =================================================

            const svg =
                construirSvgBrat(
                    layoutFrame,
                    {
                        desfoque: 10,

                        escalaX: 1.0,

                        deslocamentoX: -130,

                        deslocamentoY: 0
                    }
                );

            // =================================================
            // REDUÇÃO DE QUALIDADE
            // =================================================

            /*
             * Primeiro reduzimos a imagem.
             *
             * Depois voltamos para 1000x1000.
             *
             * Isso cria uma aparência mais próxima
             * do renderizador do Brat Generator.
             */

            const bufferRgba =
                await sharp(
                    Buffer.from(svg)
                )
                    .resize(
                        500,
                        500
                    )
                    .resize(
                        1000,
                        1000
                    )
                    .ensureAlpha()
                    .raw()
                    .toBuffer();

            // =================================================
            // VELOCIDADE
            // =================================================

            encoder.setDelay(
                i === 0
                    ? 300
                    : 450
            );

            encoder.addFrame(
                bufferRgba
            );
        }

        // ====================================================
        // FRAME FINAL
        // ====================================================

        const svgFinal =
            construirSvgBrat(
                layoutCompleto,
                {
                    desfoque: 2.8,

                    escalaX: 1.0,

                    deslocamentoX: -95,

                    deslocamentoY: 0
                }
            );

        const bufferFinal =
            await sharp(
                Buffer.from(svgFinal)
            )
                .resize(
                    500,
                    500
                )
                .resize(
                    1000,
                    1000
                )
                .ensureAlpha()
                .raw()
                .toBuffer();

        /*
         * Mantém a frase final na tela.
         */
        encoder.setDelay(
            1800
        );

        encoder.addFrame(
            bufferFinal
        );

        // ====================================================
        // FINALIZA GIF
        // ====================================================

        encoder.finish();

        const bufferGif =
            encoder.out.getData();

        // ====================================================
        // ENVIA
        // ====================================================

        const figurinhaAnimada =
            new MessageMedia(
                'image/gif',
                bufferGif.toString('base64'),
                'brat.gif'
            );

        await client.sendMessage(
            message.from,
            figurinhaAnimada,
            {
                sendMediaAsSticker: true
            }
        );

        await reagir(
            message,
            '✅'
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao gerar brat2:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ _Não foi possível gerar a figurinha animada brat._`
        );
    }
}

// ============================================================
// MUSIC PLAYER
// ============================================================

async function cortarAudio(
    bufferAudio,
    limiteMinutos
) {

    return new Promise(
        (resolve, reject) => {

            const segundos =
                Math.floor(
                    limiteMinutos * 60
                );

            const entrada =
                require('stream').Readable.from(
                    bufferAudio
                );

            const chunks = [];

            const processo =
                spawn(
                    ffmpeg,
                    [
                        '-hide_banner',
                        '-loglevel',
                        'error',

                        '-i',
                        'pipe:0',

                        '-t',
                        String(segundos),

                        '-vn',

                        '-acodec',
                        'libmp3lame',

                        '-b:a',
                        '128k',

                        '-f',
                        'mp3',

                        'pipe:1'
                    ]
                );

            processo.stdout.on(
                'data',
                chunk => {
                    chunks.push(chunk);
                }
            );

            processo.stderr.on(
                'data',
                chunk => {
                    console.log(
                        '⚠️ FFmpeg:',
                        chunk.toString()
                    );
                }
            );

            processo.on(
                'error',
                erro => {
                    reject(erro);
                }
            );

            processo.on(
                'close',
                codigo => {

                    if (codigo !== 0) {

                        reject(
                            new Error(
                                `FFmpeg encerrou com código ${codigo}`
                            )
                        );

                        return;
                    }

                    resolve(
                        Buffer.concat(chunks)
                    );
                }
            );

            entrada.pipe(
                processo.stdin
            );
        }
    );
}


async function processarAudioComLimite(
    arquivoEntrada,
    arquivoSaida,
    limiteMinutos
) {
    return new Promise((resolve, reject) => {

        const limiteSegundos =
            limiteMinutos * 60;

        const processo =
            spawn(ffmpeg, [
                '-y',

                '-i',
                arquivoEntrada,

                '-t',
                String(limiteSegundos),

                '-vn',

                '-codec:a',
                'libmp3lame',

                '-b:a',
                '128k',

                arquivoSaida
            ]);

        let erro = '';

        processo.stderr.on(
            'data',
            dados => {
                erro += dados.toString();
            }
        );

        processo.on(
            'close',
            codigo => {

                if (codigo === 0) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            `FFmpeg terminou com código ${codigo}\n${erro}`
                        )
                    );
                }
            }
        );

        processo.on(
            'error',
            reject
        );
    });
}

// ============================================================
// TOCAR MÚSICA
// ============================================================

async function tocarMusica(
    message,
    argumento
) {

    const termoBusca =
        argumento.trim();

    if (!termoBusca) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐌𝐔́𝐒𝐈𝐂𝐀 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐀.*

_Exemplo:_

*${PREFIXO}playm nome da música*`
        );

        return;
    }

    try {

        await reagir(
            message,
            '🔎'
        );

        // ----------------------------------------------------
        // YOUTUBE / YT-DLP
        // PESQUISAR A MÚSICA
        // ----------------------------------------------------

        const resultadoBusca =
            await ytdlp(
                `ytsearch1:${termoBusca}`,
                {
                    dumpSingleJson: true,
                    noWarnings: true,
                    skipDownload: true,
                    noPlaylist: true
                }
            );

        const video =
            resultadoBusca.entries &&
            resultadoBusca.entries[0];

        if (!video) {

            throw new Error(
                'Música não encontrada no YouTube.'
            );
        }

        // ----------------------------------------------------
        // INFORMAÇÕES
        // ----------------------------------------------------

        const titulo =
            video.title ||
            'Não informado';

        const artista =
            video.artist ||
            video.uploader ||
            video.channel ||
            'Não informado';

        let duracao =
            'Não informada';

        if (
            typeof video.duration === 'number'
        ) {

            const minutos =
                Math.floor(
                    video.duration / 60
                );

            const segundos =
                Math.floor(
                    video.duration % 60
                );

            duracao =
                `${minutos}:${String(
                    segundos
                ).padStart(2, '0')}`;
        }

        const views =
            Number(
                video.view_count || 0
            ).toLocaleString(
                'pt-BR'
            );

        const urlVideo =
            video.webpage_url ||
            `https://www.youtube.com/watch?v=${video.id}`;

        // ----------------------------------------------------
        // CAPA DO VÍDEO
        // ----------------------------------------------------

        let capa = null;

        if (
            video.thumbnail
        ) {

            try {

                const respostaCapa =
                    await fetch(
                        video.thumbnail
                    );

                if (
                    respostaCapa.ok
                ) {

                    const bytes =
                        await respostaCapa.arrayBuffer();

                    capa =
                        new MessageMedia(
                            'image/jpeg',
                            Buffer
                                .from(bytes)
                                .toString(
                                    'base64'
                                ),
                            'capa.jpg'
                        );
                }

            } catch (erro) {

                console.log(
                    '⚠️ Erro ao baixar thumbnail:',
                    erro.message
                );
            }
        }

        // ----------------------------------------------------
        // INFORMAÇÕES
        // ----------------------------------------------------

        const informacoes =
            `┏═•❃༺✿༻❃•═┓
│   *🎵 𝐌𝐔́𝐒𝐈𝐂𝐀*
├✯
├➤ *𝐓𝐈́𝐓𝐔𝐋𝐎:*
│   _${titulo}_
│
├➤ *𝐀𝐑𝐓𝐈𝐒𝐓𝐀:*
│   _${artista}_
│
├➤ *⏱️ 𝐃𝐔𝐑𝐀𝐂̧𝐀̃𝐎:*
│   _${duracao}_
│
├➤ *👀 𝐕𝐈𝐄𝐖𝐒:*
│   _${views}_
│
├➤ 🔗 *${urlVideo}*
│
┗═•❃༺✿༻❃•═┓`;

        // ----------------------------------------------------
        // ENVIAR CAPA + INFORMAÇÕES
        // ----------------------------------------------------

        if (capa) {

            await client.sendMessage(
                message.from,
                capa,
                {
                    caption:
                        informacoes
                }
            );

        } else {

            await responderCitando(
                message,
                informacoes
            );
        }

        // ----------------------------------------------------
        // ÁUDIO
        // ----------------------------------------------------

        await reagir(
            message,
            '⬇️'
        );

        const pastaTemporaria =
            path.join(
                os.tmpdir(),
                'justbot-audio'
            );

        if (
            !fs.existsSync(
                pastaTemporaria
            )
        ) {

            fs.mkdirSync(
                pastaTemporaria,
                {
                    recursive: true
                }
            );
        }

        // ----------------------------------------------------
        // IDENTIFICADOR DO ARQUIVO
        // ----------------------------------------------------

        const idAudio =
            `${Date.now()}-${String(
                message.id.id || 'audio'
            )}`;

        const modeloDownload =
            path.join(
                pastaTemporaria,
                `${idAudio}-download.%(ext)s`
            );

        const arquivoFinal =
            path.join(
                pastaTemporaria,
                `${idAudio}.mp3`
            );

        let caminhoArquivoBaixado = null;

        try {

            // ------------------------------------------------
            // BAIXAR ÁUDIO ORIGINAL
            // ------------------------------------------------
            // O yt-dlp apenas baixa o áudio.
            // A conversão para MP3 será feita pelo
            // nosso FFmpeg depois.
            // ------------------------------------------------

            await ytdlp(
                urlVideo,
                {
                    format: 'bestaudio/best',
                    output: modeloDownload,
                    noPlaylist: true,
                    noWarnings: true
                }
            );

            // ------------------------------------------------
            // LOCALIZAR ARQUIVO BAIXADO
            // ------------------------------------------------

            const arquivosBaixados =
                fs.readdirSync(
                    pastaTemporaria
                );

            const arquivoBaixado =
                arquivosBaixados.find(
                    arquivo =>
                        arquivo.startsWith(
                            `${idAudio}-download.`
                        )
                );

            if (!arquivoBaixado) {

                throw new Error(
                    'Arquivo de áudio não foi encontrado após o download.'
                );
            }

            caminhoArquivoBaixado =
                path.join(
                    pastaTemporaria,
                    arquivoBaixado
                );

            // ------------------------------------------------
            // CONVERTER PARA MP3 E LIMITAR A 5 MINUTOS
            // ------------------------------------------------

            await processarAudioComLimite(
                caminhoArquivoBaixado,
                arquivoFinal,
                LIMITE_PREVIA_MINUTOS
            );

            // ------------------------------------------------
            // VERIFICAR SE O MP3 FOI CRIADO
            // ------------------------------------------------

            if (
                !fs.existsSync(
                    arquivoFinal
                )
            ) {

                throw new Error(
                    'FFmpeg não criou o arquivo MP3.'
                );
            }

            // ------------------------------------------------
            // ENVIAR ÁUDIO
            // ------------------------------------------------

            const audio =
                MessageMedia.fromFilePath(
                    arquivoFinal
                );

            await client.sendMessage(
                message.from,
                audio,
                {
                    sendAudioAsVoice: false
                }
            );

            await reagir(
                message,
                '🎵'
            );

        } catch (erroAudio) {

            console.error(
                '❌ Erro ao processar áudio:',
                erroAudio
            );

            await responderCitando(
                message,
                `❌ *NÃO FOI POSSÍVEL PROCESSAR O ÁUDIO.*

_O conteúdo pode não permitir download ou ocorreu um erro durante o processamento._`
            );

            await reagir(
                message,
                '❌'
            );

        } finally {

            // ------------------------------------------------
            // LIMPAR ARQUIVOS TEMPORÁRIOS
            // ------------------------------------------------

            try {

                if (
                    caminhoArquivoBaixado &&
                    fs.existsSync(
                        caminhoArquivoBaixado
                    )
                ) {

                    fs.unlinkSync(
                        caminhoArquivoBaixado
                    );
                }

                if (
                    fs.existsSync(
                        arquivoFinal
                    )
                ) {

                    fs.unlinkSync(
                        arquivoFinal
                    );
                }

            } catch (erroLimpeza) {

                console.log(
                    '⚠️ Erro ao limpar arquivos temporários:',
                    erroLimpeza.message
                );
            }
        }

    } catch (erro) {

        console.error(
            '❌ Erro no playm:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐍𝐀̃𝐎 𝐅𝐎𝐈 𝐏𝐎𝐒𝐒𝐈́𝐕𝐄𝐋 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐑 𝐀 𝐌𝐔́𝐒𝐈𝐂𝐀.*

_Tente pesquisar pelo nome completo da música e artista._`
        );
    }
}

// ============================================================
// CONFIGURAÇÕES DO PLAYM
// ============================================================

const LIMITE_PREVIA_MINUTOS = 10;

// ============================================================
// TOCAR VÍDEO
// ============================================================

async function tocarVideo(
    message,
    argumento
) {

    const termoBusca =
        argumento.trim();

    if (!termoBusca) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐕𝐈́𝐃𝐄𝐎 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_

*${PREFIXO}playv nome do vídeo*`
        );

        return;
    }

    try {

        await reagir(
            message,
            '🔎'
        );

        // ----------------------------------------------------
        // PESQUISAR VÍDEO
        // ----------------------------------------------------

        const resultadoBusca =
            await ytdlp(
                `ytsearch1:${termoBusca}`,
                {
                    dumpSingleJson: true,
                    noWarnings: true,
                    skipDownload: true,
                    noPlaylist: true
                }
            );

        const video =
            resultadoBusca.entries &&
            resultadoBusca.entries[0];

        if (!video) {

            throw new Error(
                'Vídeo não encontrado no YouTube.'
            );
        }

        // ----------------------------------------------------
        // INFORMAÇÕES
        // ----------------------------------------------------

        const titulo =
            video.title ||
            'Não informado';

        const canal =
            video.uploader ||
            video.channel ||
            'Não informado';

        let duracao =
            'Não informada';

        if (
            typeof video.duration === 'number'
        ) {

            const minutos =
                Math.floor(
                    video.duration / 60
                );

            const segundos =
                Math.floor(
                    video.duration % 60
                );

            duracao =
                `${minutos}:${String(
                    segundos
                ).padStart(2, '0')}`;
        }

        const views =
            Number(
                video.view_count || 0
            ).toLocaleString(
                'pt-BR'
            );

        const urlVideo =
            video.webpage_url ||
            `https://www.youtube.com/watch?v=${video.id}`;

        // ----------------------------------------------------
        // CAPA DO VÍDEO
        // ----------------------------------------------------

        let capa = null;

        if (
            video.thumbnail
        ) {

            try {

                const respostaCapa =
                    await fetch(
                        video.thumbnail
                    );

                if (
                    respostaCapa.ok
                ) {

                    const bytes =
                        await respostaCapa.arrayBuffer();

                    capa =
                        new MessageMedia(
                            'image/jpeg',
                            Buffer
                                .from(bytes)
                                .toString(
                                    'base64'
                                ),
                            'capa-video.jpg'
                        );
                }

            } catch (erro) {

                console.log(
                    '⚠️ Erro ao baixar thumbnail:',
                    erro.message
                );
            }
        }

        // ----------------------------------------------------
        // INFORMAÇÕES
        // ----------------------------------------------------

        const informacoes =
            `┏═•❃༺✿༻❃•═┓
│   *🎬 𝐕𝐈́𝐃𝐄𝐎*
├✯
├➤ *𝐓𝐈́𝐓𝐔𝐋𝐎:*
│   _${titulo}_
│
├➤ *𝐂𝐀𝐍𝐀𝐋:*
│   _${canal}_
│
├➤ *⏱️ 𝐃𝐔𝐑𝐀𝐂̧𝐀̃𝐎:*
│   _${duracao}_
│
├➤ *👀 𝐕𝐈𝐄𝐖𝐒:*
│   _${views}_
│
├➤ 🔗 *${urlVideo}*
│
┗═•❃༺✿༻❃•═┓`;

        // ----------------------------------------------------
        // ENVIAR CAPA + INFORMAÇÕES
        // ----------------------------------------------------

        if (capa) {

            await client.sendMessage(
                message.from,
                capa,
                {
                    caption:
                        informacoes
                }
            );

        } else {

            await responderCitando(
                message,
                informacoes
            );
        }

        // ----------------------------------------------------
        // ÁUDIO/VÍDEO
        // ----------------------------------------------------

        await reagir(
            message,
            '⬇️'
        );

        // ----------------------------------------------------
        // PASTA TEMPORÁRIA
        // ----------------------------------------------------

        const pastaTemporaria =
            path.join(
                os.tmpdir(),
                'justbot-video'
            );

        if (
            !fs.existsSync(
                pastaTemporaria
            )
        ) {

            fs.mkdirSync(
                pastaTemporaria,
                {
                    recursive: true
                }
            );
        }

        // ----------------------------------------------------
        // IDENTIFICADOR
        // ----------------------------------------------------

        const idVideo =
            `${Date.now()}-${String(
                message.id.id || 'video'
            )}`;

        const modeloDownload =
            path.join(
                pastaTemporaria,
                `${idVideo}-download.%(ext)s`
            );

        const arquivoFinal =
            path.join(
                pastaTemporaria,
                `${idVideo}.mp4`
            );

        let caminhoArquivoBaixado = null;

        try {

            // ------------------------------------------------
            // BAIXAR VÍDEO
            // ------------------------------------------------
            // Preferimos MP4 até 720p quando disponível.
            // Não usamos extractVideo nem pós-processamento
            // do yt-dlp. O FFmpeg fará isso depois.
            // ------------------------------------------------

await ytdlp(
    urlVideo,
    {
        format: 'bestvideo+bestaudio/best',
        output: modeloDownload,
        ffmpegLocation: path.dirname(ffmpeg),
        mergeOutputFormat: 'mp4',
        noPlaylist: true,
        noWarnings: true
    }
);

            // ------------------------------------------------
            // LOCALIZAR ARQUIVO
            // ------------------------------------------------

            const arquivosBaixados =
                fs.readdirSync(
                    pastaTemporaria
                );

            const arquivoBaixado =
                arquivosBaixados.find(
                    arquivo =>
                        arquivo.startsWith(
                            `${idVideo}-download.`
                        )
                );

            if (!arquivoBaixado) {

                throw new Error(
                    'Arquivo de vídeo não foi encontrado após o download.'
                );
            }

            caminhoArquivoBaixado =
                path.join(
                    pastaTemporaria,
                    arquivoBaixado
                );

            // ------------------------------------------------
            // PROCESSAR COM FFMPEG
            // ------------------------------------------------
            // Máximo de 5 minutos.
            // Converte para MP4.
            // Redimensiona para no máximo 720p.
            // H.264 + AAC para melhor compatibilidade.
            // ------------------------------------------------

            await new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const limiteSegundos =
                        LIMITE_PREVIA_MINUTOS * 120;

                    const processo =
                        spawn(
                            ffmpeg,
                            [
                                '-y',

                                '-i',
                                caminhoArquivoBaixado,

                                // Limite de duração
                                '-t',
                                String(
                                    limiteSegundos
                                ),

                                // Vídeo
                                '-vf',
                                'scale=-2:min(720\\,ih)',

                                '-c:v',
                                'libx264',

                                '-preset',
                                'veryfast',

                                '-crf',
                                '28',

                                '-pix_fmt',
                                'yuv420p',

                                // Áudio
                                '-c:a',
                                'aac',

                                '-b:a',
                                '128k',

                                // Compatibilidade MP4
                                '-movflags',
                                '+faststart',

                                arquivoFinal
                            ]
                        );

                    let erro = '';

                    processo.stderr.on(
                        'data',
                        dados => {

                            erro +=
                                dados.toString();
                        }
                    );

                    processo.on(
                        'close',
                        codigo => {

                            if (
                                codigo === 0
                            ) {

                                resolve();

                            } else {

                                reject(
                                    new Error(
                                        `FFmpeg terminou com código ${codigo}\n${erro}`
                                    )
                                );
                            }
                        }
                    );

                    processo.on(
                        'error',
                        reject
                    );
                }
            );

            // ------------------------------------------------
            // VERIFICAR MP4
            // ------------------------------------------------

            if (
                !fs.existsSync(
                    arquivoFinal
                )
            ) {

                throw new Error(
                    'FFmpeg não criou o arquivo MP4.'
                );
            }

            // ------------------------------------------------
            // VERIFICAR TAMANHO
            // ------------------------------------------------

            const tamanhoArquivo =
                fs.statSync(
                    arquivoFinal
                ).size;

            const tamanhoMB =
                tamanhoArquivo /
                (1024 * 1024);

            console.log(
                `🎬 Vídeo processado: ${tamanhoMB.toFixed(2)} MB`
            );

            // ------------------------------------------------
            // LIMITE DE SEGURANÇA
            // ------------------------------------------------

            const LIMITE_VIDEO_MB = 1000;

            if (
                tamanhoMB >
                LIMITE_VIDEO_MB
            ) {

                throw new Error(
                    `O vídeo processado ficou muito grande (${tamanhoMB.toFixed(2)} MB).`
                );
            }

            // ------------------------------------------------
            // ENVIAR VÍDEO
            // ------------------------------------------------

            const videoMedia =
                MessageMedia.fromFilePath(
                    arquivoFinal
                );

            await client.sendMessage(
                message.from,
                videoMedia,
                {
                    sendVideoAsGif: false,
                    caption:
                        `🎬 *${titulo}*`
                }
            );

            await reagir(
                message,
                '🎬'
            );

        } catch (erroVideo) {

            console.error(
                '❌ Erro ao processar vídeo:',
                erroVideo
            );

            await responderCitando(
                message,
                `❌ *NÃO FOI POSSÍVEL PROCESSAR O VÍDEO.*

_O vídeo pode não estar disponível para download, ser incompatível ou ter ultrapassado o limite permitido._`
            );

            await reagir(
                message,
                '❌'
            );

        } finally {

            // ------------------------------------------------
            // LIMPAR ARQUIVOS TEMPORÁRIOS
            // ------------------------------------------------

            try {

                if (
                    caminhoArquivoBaixado &&
                    fs.existsSync(
                        caminhoArquivoBaixado
                    )
                ) {

                    fs.unlinkSync(
                        caminhoArquivoBaixado
                    );
                }

                if (
                    fs.existsSync(
                        arquivoFinal
                    )
                ) {

                    fs.unlinkSync(
                        arquivoFinal
                    );
                }

            } catch (erroLimpeza) {

                console.log(
                    '⚠️ Erro ao limpar arquivos temporários:',
                    erroLimpeza.message
                );
            }
        }

    } catch (erro) {

        console.error(
            '❌ Erro no playv:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐍𝐀̃𝐎 𝐅𝐎𝐈 𝐏𝐎𝐒𝐒𝐈́𝐕𝐄𝐋 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐑 𝐎 𝐕𝐈́𝐃𝐄𝐎.*

_Tente pesquisar pelo nome completo do vídeo._`
        );
    }
}

// ============================================================
// MODERAÇÃO
// ============================================================

async function banirPessoa(message) {
    try {
        if (!(await exigirAdmin(message))) return;

        const pessoa = await exigirPessoa(message);
        if (!pessoa) return;

        const idPessoa = idDaPessoa(pessoa);
        if (!idPessoa) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não consegui identificar essa pessoa._');
            return;
        }

        const botId = client.info?.wid?._serialized || null;
        const idRemetente = obterIdRemetente(message);

        if (botId && idsIguais(idPessoa, botId)) {
            await reagir(message, '🤨');
            await responderCitando(message, '🤨 _Bonito. Tentando banir o próprio segurança da festa._');
            return;
        }

        if (idRemetente && idsIguais(idPessoa, idRemetente)) {
            await reagir(message, '🤨');
            await responderCitando(message, '🤨 _Você realmente tentou se expulsar do próprio grupo._');
            return;
        }

        // O message.getChat() usa Client.getChatById(), que está apresentando
        // o erro interno `r: r` em versões recentes do WhatsApp Web.
        // Para o ban, acessamos o chat diretamente no contexto do WhatsApp Web.
        let dadosGrupo = null;
        let ultimoErroChat = null;

        for (let tentativa = 1; tentativa <= 3; tentativa++) {
            try {
                dadosGrupo = await client.pupPage.evaluate(async (chatId) => {
                    const chat = await window.WWebJS.getChat(chatId, {
                        getAsModel: false,
                    });

                    if (!chat) {
                        return null;
                    }

                    const participantes =
                        chat.groupMetadata?.participants?.getModelsArray?.() || [];

                    return {
                        isGroup: chat.id?.server === 'g.us' || !!chat.isGroup,
                        participants: participantes.map(participante => ({
                            id: participante.id?._serialized || null,
                            isAdmin: !!participante.isAdmin,
                            isSuperAdmin: !!participante.isSuperAdmin,
                        })),
                    };
                }, message.from);

                if (dadosGrupo) break;
            } catch (erroChat) {
                ultimoErroChat = erroChat;
                console.log(
                    `⚠️ Não foi possível acessar o grupo diretamente para o ban (tentativa ${tentativa}/3):`,
                    erroChat.message
                );

                if (tentativa < 3) {
                    await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
                }
            }
        }

        if (!dadosGrupo) {
            throw ultimoErroChat || new Error('Não foi possível acessar o grupo.');
        }

        if (!dadosGrupo.isGroup) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Esse comando só funciona em grupos._');
            return;
        }

        const participante = dadosGrupo.participants?.find(item => {
            return item.id && idsIguais(item.id, idPessoa);
        });

        if (participante?.isAdmin || participante?.isSuperAdmin) {
            await reagir(message, '👑');
            await responderCitando(message, '👑 _Nem pensar. Administrador não entra na fila da expulsão._');
            return;
        }

        const mencao = mencaoDaPessoa(pessoa);
        const idsParaTentar = [...new Set([idPessoa, ...(await obterIdsPessoa(pessoa))])];
        let removido = false;
        let ultimoErro = null;

        for (const id of idsParaTentar) {
            try {
                await client.pupPage.evaluate(async (chatId, participantIds) => {
                    const chat = await window.WWebJS.getChat(chatId, {
                        getAsModel: false,
                    });

                    if (!chat || chat.id?.server !== 'g.us') {
                        throw new Error('O chat informado não é um grupo.');
                    }

                    const participantes = (
                        await Promise.all(
                            participantIds.map(async participanteId => {
                                const { lid, phone } =
                                    await window.WWebJS.enforceLidAndPnRetrieval(participanteId);

                                return (
                                    chat.groupMetadata.participants.get(lid?._serialized) ||
                                    chat.groupMetadata.participants.get(phone?._serialized)
                                );
                            })
                        )
                    ).filter(Boolean);

                    if (!participantes.length) {
                        throw new Error('A pessoa não foi encontrada entre os participantes do grupo.');
                    }

                    await window
                        .require('WAWebModifyParticipantsGroupAction')
                        .removeParticipants(chat, participantes);

                    return { status: 200 };
                }, message.from, [id]);

                removido = true;
                break;
            } catch (erroRemocao) {
                ultimoErro = erroRemocao;
            }
        }

        if (!removido) throw ultimoErro || new Error('O WhatsApp recusou a remoção.');

        await reagir(message, '🔨');
        await enviarComMencoes(
            message.from,
            `┏═•❃༺🔨༻❃•═┓
│      *𝐁𝐀𝐍 𝐄𝐅𝐄𝐓𝐈𝐕𝐀𝐃𝐎*
├✯
│
├➤ 👤 ${mencao} foi expulso(a) do grupo.
│
├➤ 🔨 _A democracia fez uma pausa._
├➤ 🚪 _A porta de saída estava logo ali._
├➤ 😭 _Volte quando o universo perdoar você._
│
┗═•❃༺🔨༻❃•═┛`,
            { mentions: [idPessoa] }
        );
    } catch (erro) {
        console.error('❌ Erro ao banir pessoa:', erro);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui expulsar essa pessoa._\n\n_Confira se eu sou administrador do grupo e se a pessoa não é administradora._');
    }
}

async function mutarPessoa(message) {

    const permitido =
        await exigirAdmin(message);

    if (!permitido) {
        return;
    }

    let pessoa = null;
    let idPessoa = null;
    let mensagemAlvo = null;

    // ============================================================
    // 1. TENTAR OBTER PESSOA POR MENÇÃO
    // ============================================================

    const mencoes =
        await message.getMentions();

    if (
        mencoes &&
        mencoes.length > 0
    ) {

        pessoa = mencoes[0];

        idPessoa =
            idDaPessoa(pessoa);
    }

    // ============================================================
    // 2. SE NÃO HOUVE MENÇÃO, VERIFICAR SE É UMA RESPOSTA
    // ============================================================

    if (
        !idPessoa &&
        message.hasQuotedMsg
    ) {

        try {

            mensagemAlvo =
                await message.getQuotedMessage();

            if (
                mensagemAlvo
            ) {

                idPessoa =
                    mensagemAlvo.author ||
                    mensagemAlvo.from ||
                    null;

                console.log(
                    '🔇 ID DA PESSOA RESPONDIDA:',
                    idPessoa
                );
            }

        } catch (erro) {

            console.log(
                '⚠️ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. NINGUÉM FOI ENCONTRADO
    // ============================================================

    if (!idPessoa) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *𝐌𝐄𝐍𝐂̧𝐀̃𝐎 𝐎𝐔 𝐑𝐄𝐏𝐋𝐘 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎*
│
├➤ _Mencione alguém ou responda_
│   _à mensagem da pessoa._
│
├➤ *𝐄𝐗𝐄𝐌𝐏𝐋𝐎𝐒:*
│
├➤ ${PREFIXO}mute @pessoa
├➤ Responda à mensagem com ${PREFIXO}mute
│
┗═•❃༺✿༻❃•═┛`
        );

        return;
    }

    // ============================================================
    // 4. NÃO PERMITE MUTAR O PRÓPRIO BOT
    // ============================================================

    const botId =
        client.info &&
        client.info.wid &&
        client.info.wid._serialized;

    if (
        botId &&
        idsIguais(
            idPessoa,
            botId
        )
    ) {

        await reagir(
            message,
            '🤨'
        );

        await responderCitando(
            message,
            '🤨 _Eu não posso me mutar, né._'
        );

        return;
    }

    // ============================================================
    // 5. CRIAR LISTA DE MUTADOS DO GRUPO
    // ============================================================

    if (
        !mutados.has(
            message.from
        )
    ) {

        mutados.set(
            message.from,
            new Set()
        );
    }

    const listaMutados =
        mutados.get(
            message.from
        );

  const idsPessoa =
    await obterIdsPessoa(
        pessoa || idPessoa
    );

for (const id of idsPessoa) {
    listaMutados.add(id);
}

salvarMutados();

    // ============================================================
    // 6. NOME / MENÇÃO
    // ============================================================

    let mencao = `@${String(idPessoa).split('@')[0]}`;

    if (pessoa) {

        mencao =
            mencaoDaPessoa(
                pessoa
            );

    } else if (
        mensagemAlvo &&
        mensagemAlvo._data
    ) {

        const nome =
            mensagemAlvo._data.notifyName ||
            mensagemAlvo._data.pushname;

        if (nome) {
            mencao = nome;
        }
    }

    // ============================================================
    // 7. APAGAR A MENSAGEM RESPONDIDA
    // ============================================================

    if (
        mensagemAlvo &&
        typeof mensagemAlvo.delete === 'function'
    ) {

        try {

            await mensagemAlvo.delete(true);

            console.log(
                '🗑️ Mensagem do usuário mutado apagada.'
            );

        } catch (erro) {

            console.log(
                '⚠️ Não foi possível apagar a mensagem:',
                erro.message
            );
        }
    }

    // ============================================================
    // 8. REAÇÃO
    // ============================================================

    await reagir(
        message,
        '🔇'
    );

    // ============================================================
    // 9. AVISO
    // ============================================================

    await enviarComMencoes(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *🔇 𝐌𝐔𝐓𝐄*
├✯
├➤ _${mencao} foi silenciado._
│
├➤ _As mensagens dessa pessoa_
│   _serão apagadas automaticamente._
│
┗═•❃༺✿༻❃•═┛`,
        {
            mentions: [
                idPessoa
            ]
        }
    );
}

async function desmutarPessoa(message) {

    const permitido =
        await exigirAdmin(message);

    if (!permitido) {
        return;
    }

    let pessoa = null;
    let idPessoa = null;
    let idsPessoa = new Set();

    // ============================================================
    // 1. TENTAR ENCONTRAR POR MENÇÃO
    // ============================================================

    const mencoes =
        await message.getMentions();

    if (
        mencoes &&
        mencoes.length > 0
    ) {

        pessoa = mencoes[0];

        idPessoa =
            idDaPessoa(pessoa);

        console.log(
            '🔓 PESSOA MENCIONADA:',
            idPessoa
        );

        idsPessoa =
            await obterIdsPessoa(pessoa);
    }

    // ============================================================
    // 2. TENTAR ENCONTRAR PELA MENSAGEM RESPONDIDA
    // ============================================================

    if (
        !idPessoa &&
        message.hasQuotedMsg
    ) {

        try {

            const mensagemAlvo =
                await message.getQuotedMessage();

            if (mensagemAlvo) {

                idPessoa =
                    mensagemAlvo.author ||
                    mensagemAlvo.from ||
                    null;

                console.log(
                    '🔓 PESSOA RESPONDIDA:',
                    idPessoa
                );

                if (idPessoa) {

                    idsPessoa =
                        await obterIdsPessoa(
                            idPessoa
                        );
                }
            }

        } catch (erro) {

            console.log(
                '⚠️ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. SE NÃO ENCONTROU NINGUÉM
    // ============================================================

    if (!idPessoa) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *PESSOA NÃO INFORMADA.*

Use uma menção ou responda à mensagem da pessoa.

*Exemplo:*

*${PREFIXO}unmute @pessoa*`
        );

        return;
    }

    // ============================================================
    // 4. GARANTIR O ID PRINCIPAL
    // ============================================================

    idsPessoa.add(
        idPessoa
    );

    // ============================================================
    // 5. VERIFICAR A LISTA DE MUTADOS DO GRUPO
    // ============================================================

    const listaMutados =
        mutados.get(
            message.from
        );

    if (
        !listaMutados
    ) {

        await reagir(
            message,
            '⚠️'
        );

        await responderCitando(
            message,
            '⚠️ _Não há ninguém mutado neste grupo._'
        );

        return;
    }

    // ============================================================
    // 6. REMOVER TODOS OS IDs DA PESSOA
    // ============================================================

    let removido = false;

    for (
        const id of idsPessoa
    ) {

        if (
            listaMutados.delete(id)
        ) {

            removido = true;

            console.log(
                '🔓 ID removido dos mutados:',
                id
            );
        }
    }

    // ============================================================
    // 7. VERIFICAR TAMBÉM PELO NÚMERO
    // ============================================================

    if (!removido) {

        const idsLista =
            [...listaMutados];

        for (
            const idMutado
            of idsLista
        ) {

            const numeroMutado =
                String(idMutado)
                    .split('@')[0];

            for (
                const idPessoaAtual
                of idsPessoa
            ) {

                const numeroPessoa =
                    String(idPessoaAtual)
                        .split('@')[0];

                if (
                    numeroMutado ===
                    numeroPessoa
                ) {

                    listaMutados.delete(
                        idMutado
                    );

                    removido = true;

                    console.log(
                        '🔓 ID removido por número:',
                        idMutado
                    );

                    break;
                }
            }

            if (removido) {
                break;
            }
        }
    }

    // ============================================================
    // 8. PESSOA NÃO ESTAVA MUTADA
    // ============================================================

    if (!removido) {

        await reagir(
            message,
            '⚠️'
        );

        await responderCitando(
            message,
            '⚠️ _Essa pessoa não está mutada neste grupo._'
        );

        return;
    }

    // ============================================================
    // 9. SALVAR ALTERAÇÃO
    // ============================================================

    salvarMutados();

    // ============================================================
    // 10. RESPOSTA
    // ============================================================

    let mencao =
        `@${String(idPessoa).split('@')[0]}`;

    if (pessoa) {

        mencao =
            mencaoDaPessoa(
                pessoa
            );
    }

    await reagir(
        message,
        '🔓'
    );

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🔓 𝐔𝐍𝐌𝐔𝐓𝐄*
├✯
├➤ _${mencao} foi desmutado._
│
├➤ _As mensagens dessa pessoa_
│   _não serão mais apagadas._
│
┗═•❃༻❃•═┛`
    );
}

// ============================================================
// 📢 TTG
// ============================================================

async function ttg(message, argumentos) {

    // 👑 Somente administradores
    const permitido =
        await exigirAdmin(message);

    if (!permitido) {
        return;
    }

    const texto =
        argumentos.trim();

    if (!texto) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺📢༻❃•═┓
│
│  *𝐓𝐓𝐆*
│
├➤ Você precisa escrever
│   o texto que deseja enviar.
│
│  💡 Exemplo:
│  *${PREFIXO}ttg prazer a todos*
│
┗═•❃༺📢༻❃•═┓`
        );

        return;
    }

    // 🗑️ Apaga o comando original
    try {

        await message.delete(true);

    } catch (erro) {

        console.log(
            '⚠️ Não foi possível apagar o comando TTG:',
            erro.message
        );
    }

    // 📢 Envia somente o texto
    await client.sendMessage(
        message.from,
        texto
    );
}

// ============================================================
// 💍 COMANDO DE CASAMENTO
// ============================================================

async function casarPessoa(
    message
) {

    let pessoa = null;
    let idPessoa = null;

    // ============================================================
    // 1. TENTAR ENCONTRAR POR MENÇÃO
    // ============================================================

    const mencoes =
        await message.getMentions();

    if (
        mencoes &&
        mencoes.length > 0
    ) {

        pessoa = mencoes[0];

        idPessoa =
            idDaPessoa(pessoa);

        console.log(
            '💍 PESSOA MARCADA:',
            idPessoa
        );
    }

    // ============================================================
    // 2. TENTAR ENCONTRAR PELA MENSAGEM RESPONDIDA
    // ============================================================

    if (
        !idPessoa &&
        message.hasQuotedMsg
    ) {

        try {

            const mensagemAlvo =
                await message.getQuotedMessage();

            if (mensagemAlvo) {

                idPessoa =
                    mensagemAlvo.author ||
                    mensagemAlvo.from ||
                    null;

                console.log(
                    '💍 PESSOA RESPONDIDA:',
                    idPessoa
                );
            }

        } catch (erro) {

            console.log(
                '⚠️ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. VERIFICAR SE FOI INFORMADA UMA PESSOA
    // ============================================================

    if (!idPessoa) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `❌ *𝐏𝐄𝐒𝐒𝐎𝐀 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐀.*

_Mencione alguém ou responda à mensagem da pessoa._

_Exemplo:_

*${PREFIXO}casar @pessoa*`
        );

        return;
    }

    // ============================================================
    // 4. DESCOBRIR QUEM ESTÁ FAZENDO O PEDIDO
    // ============================================================

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {

        await reagir(
            message,
            '❌'
        );

        return;
    }

    // ============================================================
    // 5. NÃO PODE CASAR CONSIGO MESMO
    // ============================================================

    if (
        idsIguais(
            idRemetente,
            idPessoa
        )
    ) {

        await reagir(
            message,
            '🤨'
        );

        await responderCitando(
            message,
            '🤨 _Você não pode pedir a si mesmo em casamento._'
        );

        return;
    }

    // ============================================================
    // 6. VERIFICAR SE O REMETENTE JÁ ESTÁ CASADO
    // ============================================================

    if (
        casamentos.has(
            idRemetente
        )
    ) {

        const casamento =
            casamentos.get(
                idRemetente
            );

        await reagir(
            message,
            '💍'
        );

        await responderCitando(
            message,
            '💍 _Você já está casado. Primeiro precisa resolver seu casamento atual._'
        );

        return;
    }

    // ============================================================
    // 7. VERIFICAR SE A OUTRA PESSOA JÁ ESTÁ CASADA
    // ============================================================

    if (
        casamentos.has(
            idPessoa
        )
    ) {

        await reagir(
            message,
            '💍'
        );

        await responderCitando(
            message,
            '💍 _Essa pessoa já está casada._'
        );

        return;
    }

    // ============================================================
    // 8. VERIFICAR PROPOSTAS EXISTENTES
    // ============================================================

    if (
        propostasCasamento.has(
            idPessoa
        )
    ) {

        await reagir(
            message,
            '💌'
        );

        await responderCitando(
            message,
            '💌 _Essa pessoa já possui uma proposta de casamento pendente._'
        );

        return;
    }

    // ============================================================
    // 9. CRIAR PROPOSTA
    // ============================================================

    const proposta = {

        de: idRemetente,

        para: idPessoa,

        grupo: message.from,

        data:
            new Date().toISOString()
    };

    propostasCasamento.set(
        idPessoa,
        proposta
    );

    salvarPropostasCasamento();

    // ============================================================
    // 10. NOME DA PESSOA
    // ============================================================

    let mencaoPessoa =
        `@${String(idPessoa).split('@')[0]}`;

    if (pessoa) {

        mencaoPessoa =
            mencaoDaPessoa(
                pessoa
            );
    }

    const mencaoRemetente =
        `@${String(idRemetente).split('@')[0]}`;

    // ============================================================
    // 11. ENVIAR PROPOSTA
    // ============================================================

    await reagir(
        message,
        '💍'
    );

    const imagemCasamento =
    MessageMedia.fromFilePath(
        './imagens/casamento.webp'
    );
    
await enviarComMencoes(
    message.from,
    imagemCasamento,
    {
        caption:
            `┏═•❃༺💍༻❃•═┓
│   *💍 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐃𝐄 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎*
├✯
├➤ ${mencaoRemetente}
│   _pediu ${mencaoPessoa} em casamento!_
│
├➤ 💕 ${mencaoPessoa}, você aceita?
│
├➤ *${PREFIXO}aceitar* 💍
├➤ *${PREFIXO}recusar* 💔
│
┗═•❃༺💍༻❃•═┛`,
        mentions: [
            idRemetente,
            idPessoa
        ]
    }
);

}

async function divorcioPessoa(message) {
    const idRemetente = obterIdRemetente(message);

    // Procura o casamento do usuário
    let chaveCasamento = null;
    let casamento = null;

    if (casamentos.has(idRemetente)) {
        chaveCasamento = idRemetente;
        casamento = casamentos.get(idRemetente);
    } else {
        for (const [chave, dados] of casamentos.entries()) {
            if (idsIguais(chave, idRemetente)) {
                chaveCasamento = chave;
                casamento = dados;
                break;
            }
        }
    }

    // Não está casado
    if (!casamento) {
        await message.react('❌');
        await message.reply('💔 Você não está casado com ninguém.');
        return;
    }

    const idParceiro = casamento.parceiro;

    const mencaoRemetente = `@${idRemetente.split('@')[0]}`;
    const mencaoParceiro = `@${idParceiro.split('@')[0]}`;    
    
    // Já existe uma confirmação pendente
    if (confirmacoesDivorcio.has(chaveCasamento)) {
        await message.react('⚠️');
        await message.reply(
            '💔 Você já tem um divórcio aguardando confirmação.\n\n' +
            'Use `;aceitar` para confirmar ou `;recusar` para cancelar.'
        );
        return;
    }

    // Guarda a confirmação
    confirmacoesDivorcio.set(chaveCasamento, {
        parceiro: idParceiro,
        grupo: message.from,
        data: new Date().toISOString()
    });

    await responderComMencoes(
    message,
    `┏═•❃༺💔༻❃•═┓
│   *💔 𝐃𝐈𝐕Ó𝐑𝐂𝐈𝐎*
├✯
├➤ ${mencaoRemetente}
│   _solicitou o divórcio de ${mencaoParceiro}._
│
├➤ ⚠️ *Você tem certeza?*
│
├➤ 💔 *${PREFIXO}aceitar* — Confirmar
├➤ ❤️ *${PREFIXO}recusar* — Cancelar
│
┗═•❃༺💔༻❃•═┛`,
    undefined,
    {
        mentions: [
            idRemetente,
            idParceiro
        ]
    }
);
}

async function aceitarDivorcio(message) {
    const idRemetente = obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // Procura uma confirmação de divórcio do usuário
    let confirmacao = null;
    let chaveConfirmacao = null;

    if (confirmacoesDivorcio.has(idRemetente)) {
        confirmacao = confirmacoesDivorcio.get(idRemetente);
        chaveConfirmacao = idRemetente;
    } else {
        for (const [chave, dados] of confirmacoesDivorcio.entries()) {
            if (idsIguais(chave, idRemetente)) {
                confirmacao = dados;
                chaveConfirmacao = chave;
                break;
            }
        }
    }

    // Não existe divórcio aguardando confirmação
    if (!confirmacao) {
        return false;
    }

    // Só pode confirmar no mesmo grupo onde iniciou
    if (confirmacao.grupo !== message.from) {
        return false;
    }

    const idParceiro = confirmacao.parceiro;

    // Procura a chave real do casamento do usuário
    let chaveUsuario = null;
    let chaveParceiro = null;

    for (const [chave, dados] of casamentos.entries()) {
        if (idsIguais(chave, idRemetente)) {
            chaveUsuario = chave;
        }

        if (idsIguais(chave, idParceiro)) {
            chaveParceiro = chave;
        }
    }

    // Remove os dois lados do casamento
    if (chaveUsuario) {
        casamentos.delete(chaveUsuario);
    }

    if (chaveParceiro) {
        casamentos.delete(chaveParceiro);
    }

    // Remove a confirmação
    confirmacoesDivorcio.delete(chaveConfirmacao);

    salvarCasamentos();

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    const mencaoParceiro =
        `@${idParceiro.split('@')[0]}`;

    await responderComMencoes(
        message,
        `┏═•❃༺💔༻❃•═┓
│   *💔 𝐃𝐈𝐕Ó𝐑𝐂𝐈𝐎 𝐂𝐎𝐍𝐂𝐋𝐔Í𝐃𝐎*
├✯
├➤ ${mencaoRemetente}
│   _encerrou seu casamento com ${mencaoParceiro}._
│
├➤ 🥀 O casamento foi oficialmente encerrado.
│
┗═•❃༺💔༻❃•═┛`,
        undefined,
        {
            mentions: [
                idRemetente,
                idParceiro
            ]
        }
    );

    return true;
}

async function recusarDivorcio(message) {
    const idRemetente = obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    let confirmacao = null;
    let chaveConfirmacao = null;

    if (confirmacoesDivorcio.has(idRemetente)) {
        confirmacao = confirmacoesDivorcio.get(idRemetente);
        chaveConfirmacao = idRemetente;
    } else {
        for (const [chave, dados] of confirmacoesDivorcio.entries()) {
            if (idsIguais(chave, idRemetente)) {
                confirmacao = dados;
                chaveConfirmacao = chave;
                break;
            }
        }
    }

    if (!confirmacao) {
        return false;
    }

    if (confirmacao.grupo !== message.from) {
        return false;
    }

    const idParceiro = confirmacao.parceiro;

    confirmacoesDivorcio.delete(chaveConfirmacao);

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    const mencaoParceiro =
        `@${idParceiro.split('@')[0]}`;

    await responderComMencoes(
        message,
        `┏═•❃༺❤️༻❃•═┓
│   *❤️ 𝐃𝐈𝐕Ó𝐑𝐂𝐈𝐎 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎*
├✯
├➤ ${mencaoRemetente}
│   _decidiu permanecer casado com ${mencaoParceiro}._
│
├➤ 💍 O casamento continua intacto!
│
┗═•❃༺❤️༻❃•═┛`,
        undefined,
        {
            mentions: [
                idRemetente,
                idParceiro
            ]
        }
    );

    return true;
}

// ============================================================
// 👶 ADOTAR PESSOA
// ============================================================

async function adotarPessoa(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // ============================================================
    // 👤 ENCONTRAR PESSOA
    // ============================================================

    let idPessoa = null;

    const mencionados =
        message.mentionedIds || [];

    if (mencionados.length > 0) {

        idPessoa =
            mencionados[0];

    } else if (message.hasQuotedMsg) {

        const mensagemCitada =
            await message.getQuotedMessage();

        idPessoa =
            obterIdRemetente(
                mensagemCitada
            );
    }

    // ============================================================
    // ❌ NENHUMA PESSOA ENCONTRADA
    // ============================================================

    if (!idPessoa) {

        await message.react('❌');

        await message.reply(
            `👶 Para adotar alguém, mencione a pessoa ou responda a uma mensagem dela.\n\n` +
            `Exemplo: *${PREFIXO}adotar @pessoa*`
        );

        return;
    }

    // ============================================================
    // 🚫 NÃO PODE ADOTAR A SI MESMO
    // ============================================================

    if (
        idsIguais(
            idRemetente,
            idPessoa
        )
    ) {

        await message.react('❌');

        await message.reply(
            '❌ Você não pode adotar a si mesmo!'
        );

        return;
    }

    // ============================================================
// 💍 NÃO PODE ADOTAR O PRÓPRIO CÔNJUGE
// ============================================================

let casamentoRemetente =
    casamentos.get(idRemetente);

if (!casamentoRemetente) {

    for (
        const [id, casamento]
        of casamentos
    ) {

        if (
            idsIguais(
                id,
                idRemetente
            )
        ) {

            casamentoRemetente =
                casamento;

            break;
        }
    }
}

if (
    casamentoRemetente &&
    casamentoRemetente.parceiro &&
    idsIguais(
        casamentoRemetente.parceiro,
        idPessoa
    )
) {

    await message.react('❌');

    await message.reply(
        '❌ Você não pode adotar seu par! (felizmente)'
    );

    return;
}
    
    // ============================================================
    // 🔎 VERIFICAR SE JÁ É FILHO
    // ============================================================

    const familiaRemetente =
        familias.get(idRemetente);

    if (
        familiaRemetente &&
        familiaRemetente.filhos &&
        familiaRemetente.filhos.some(
            filho =>
                idsIguais(
                    filho,
                    idPessoa
                )
        )
    ) {

        await message.react('⚠️');

        await message.reply(
            '⚠️ Essa pessoa já está registrada como seu filho!'
        );

        return;
    }

    // ============================================================
    // 🔎 VERIFICAR SE JÁ EXISTE PROPOSTA
    // ============================================================

    for (const proposta of propostasAdocao.values()) {

        if (
            idsIguais(
                proposta.para,
                idPessoa
            )
        ) {

            await message.react('⚠️');

            await message.reply(
                '⚠️ Essa pessoa já recebeu uma proposta de adoção!'
            );

            return;
        }
    }

    // ============================================================
    // 👶 CRIAR PROPOSTA
    // ============================================================

    const proposta = {

        de: idRemetente,

        para: idPessoa,

        grupo: message.from,

        data:
            new Date().toISOString()
    };

    propostasAdocao.set(
        idPessoa,
        proposta
    );

    // ============================================================
    // 📸 MENÇÕES
    // ============================================================

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    const mencaoPessoa =
        `@${idPessoa.split('@')[0]}`;

    // ============================================================
    // 👶 MENSAGEM
    // ============================================================

    await responderComMencoes(
        message,
        `┏═•❃༺👶༻❃•═┓
│   *👶 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐃𝐄 𝐀𝐃𝐎ÇÃ𝐎*
├✯
├➤ ${mencaoRemetente}
│   _quer adotar_ ${mencaoPessoa}!
│
├➤ 💭 ${mencaoPessoa}, você aceita?
│
├➤ ✅ Responda *sim*
├➤ ❌ Responda *nao*
│
┗═•❃༺👶༻❃•═┛`,
        undefined,
        {
            mentions: [
                idRemetente,
                idPessoa
            ]
        }
    );
}

async function aceitarAdocao(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return false;
    }

    let proposta = null;

    // Procura uma proposta destinada a quem respondeu
    for (const propostaAtual of propostasAdocao.values()) {

        if (
            idsIguais(
                propostaAtual.para,
                idRemetente
            )
        ) {

            proposta = propostaAtual;
            break;
        }
    }

    // Não existe proposta
    if (!proposta) {
        return false;
    }

    // ============================================================
    // 🔒 VERIFICAR O GRUPO
    // ============================================================

    if (
        proposta.grupo !== message.from
    ) {

        return false;
    }

    const idPaiMae =
        proposta.de;

    const idFilho =
        proposta.para;

    // ============================================================
    // 👨‍👩‍👧 PEGAR FAMÍLIA DO PAI/MÃE
    // ============================================================

    let familiaPaiMae =
        familias.get(idPaiMae);

    if (!familiaPaiMae) {

        familiaPaiMae = {
            filhos: []
        };
    }

    if (!familiaPaiMae.filhos) {
        familiaPaiMae.filhos = [];
    }

    // ============================================================
    // 👶 PEGAR FAMÍLIA DO FILHO
    // ============================================================

    let familiaFilho =
        familias.get(idFilho);

    if (!familiaFilho) {

        familiaFilho = {
            filhos: [],
            pais: []
        };
    }

    if (!familiaFilho.pais) {
        familiaFilho.pais = [];
    }

    // ============================================================
    // 🔎 EVITAR DUPLICAÇÃO
    // ============================================================

    const jaEhFilho =
        familiaPaiMae.filhos.some(
            filho =>
                idsIguais(
                    filho,
                    idFilho
                )
        );

    if (!jaEhFilho) {

        familiaPaiMae.filhos.push(
            idFilho
        );
    }

    const jaTemPaiMae =
        familiaFilho.pais.some(
            pai =>
                idsIguais(
                    pai,
                    idPaiMae
                )
        );

    if (!jaTemPaiMae) {

        familiaFilho.pais.push(
            idPaiMae
        );
    }

    // ============================================================
    // 💾 SALVAR
    // ============================================================

    familias.set(
        idPaiMae,
        familiaPaiMae
    );

    familias.set(
        idFilho,
        familiaFilho
    );

    propostasAdocao.delete(
        idFilho
    );

    salvarFamilias();

    // ============================================================
    // 📸 MENÇÕES
    // ============================================================

    const mencaoPaiMae =
        `@${idPaiMae.split('@')[0]}`;

    const mencaoFilho =
        `@${idFilho.split('@')[0]}`;

    // ============================================================
    // 👶 ADOÇÃO REALIZADA
    // ============================================================

    await responderComMencoes(
        message,
        `┏═•❃༺👶༻❃•═┓
│   *👶 𝐀𝐃𝐎ÇÃ𝐎 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐀*
├✯
├➤ ${mencaoFilho}
│   _aceitou ser adotado por_ ${mencaoPaiMae}!
│
├➤ 👨‍👩‍👧 Uma nova família foi formada!
│
┗═•❃༺👶༻❃•═┛`,
        undefined,
        {
            mentions: [
                idPaiMae,
                idFilho
            ]
        }
    );

    return true;
}

async function recusarAdocao(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return false;
    }

    let proposta = null;

    // Procura uma proposta destinada a quem respondeu
    for (const propostaAtual of propostasAdocao.values()) {

        if (
            idsIguais(
                propostaAtual.para,
                idRemetente
            )
        ) {

            proposta = propostaAtual;
            break;
        }
    }

    // Não existe proposta
    if (!proposta) {
        return false;
    }

    // ============================================================
    // 🔒 VERIFICAR O GRUPO
    // ============================================================

    if (
        proposta.grupo !== message.from
    ) {

        return false;
    }

    const idPaiMae =
        proposta.de;

    const mencaoPaiMae =
        `@${idPaiMae.split('@')[0]}`;

    // Remove a proposta
    propostasAdocao.delete(
        idRemetente
    );

    // ============================================================
    // ❌ RECUSOU
    // ============================================================

    await responderComMencoes(
        message,
        `┏═•❃༺👶༻❃•═┓
│   *❌ 𝐀𝐃𝐎ÇÃ𝐎 𝐑𝐄𝐂𝐔𝐒𝐀𝐃𝐀*
├✯
├➤ @${idRemetente.split('@')[0]}
│   _recusou ser adotado por_ ${mencaoPaiMae}.
│
├➤ 💔 A adoção não aconteceu.
│
┗═•❃༺👶༻❃•═┛`,
        undefined,
        {
            mentions: [
                idRemetente,
                idPaiMae
            ]
        }
    );

    return true;
}

async function mostrarFamilia(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // ============================================================
    // 👨‍👩‍👧 PEGAR FAMÍLIA
    // ============================================================

    let familia =
        familias.get(idRemetente);

    // Caso ainda não exista uma família
    if (!familia) {

        familia = {
            filhos: [],
            pais: []
        };
    }

    if (!familia.filhos) {
        familia.filhos = [];
    }

    if (!familia.pais) {
        familia.pais = [];
    }

    // ============================================================
    // 💍 PEGAR CASAMENTO
    // ============================================================

    let casamento =
        casamentos.get(idRemetente);

    // Procura usando idsIguais caso seja @lid
    if (!casamento) {

        for (
            const [id, dados]
            of casamentos
        ) {

            if (
                idsIguais(
                    id,
                    idRemetente
                )
            ) {

                casamento = dados;
                break;
            }
        }
    }

    // ============================================================
    // 📝 MONTAR MENSAGEM
    // ============================================================

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    let textoFamilia =
        `┏═•❃༺👨‍👩‍👧༻❃•═┓
│   *👨‍👩‍👧 𝐒𝐔𝐀 𝐅𝐀𝐌Í𝐋𝐈𝐀*
├✯
├➤ 👤 Você: ${mencaoRemetente}
│
`;

    const mencoes = [
        idRemetente
    ];

    // ============================================================
    // 💍 CASAMENTO
    // ============================================================

    if (
        casamento &&
        casamento.parceiro
    ) {

        const idParceiro =
            casamento.parceiro;

        const mencaoParceiro =
            `@${idParceiro.split('@')[0]}`;

        textoFamilia +=
            `├➤ 💍 ${mencaoRemetente} é casado com ${mencaoParceiro}\n│\n`;

        mencoes.push(
            idParceiro
        );

    } else {

        textoFamilia +=
            `├➤ 💍 Você não está casado.\n│\n`;
    }

    // ============================================================
    // 👶 FILHOS
    // ============================================================

    textoFamilia +=
        `├➤ 👶 *𝐅𝐈𝐋𝐇𝐎𝐒*\n`;

    if (
        familia.filhos.length === 0
    ) {

        textoFamilia +=
            `│   └─ _Nenhum filho._\n`;

    } else {

        for (
            const idFilho
            of familia.filhos
        ) {

            const mencaoFilho =
                `@${idFilho.split('@')[0]}`;

            textoFamilia +=
                `│   ├─ ${mencaoFilho}\n`;

            mencoes.push(
                idFilho
            );
        }
    }

    textoFamilia +=
        `│\n`;

    // ============================================================
    // 👨‍👩‍👧 PAIS
    // ============================================================

    textoFamilia +=
        `├➤ 👨‍👩‍👧 *𝐏𝐀𝐈𝐒 / 𝐑𝐄𝐒𝐏𝐎𝐍𝐒Á𝐕𝐄𝐈𝐒*\n`;

    if (
        familia.pais.length === 0
    ) {

        textoFamilia +=
            `│   └─ _Nenhum registrado._\n`;

    } else {

        for (
            const idPai
            of familia.pais
        ) {

            const mencaoPai =
                `@${idPai.split('@')[0]}`;

            textoFamilia +=
                `│   ├─ ${mencaoPai}\n`;

            mencoes.push(
                idPai
            );
        }
    }

    textoFamilia +=
        `│\n┗═•❃༺👨‍👩‍👧༻❃•═┛`;

    // ============================================================
    // 📸 FOTO DE QUEM FEZ O PEDIDO
    // ============================================================

    let foto =
        null;

    if (
        casamento &&
        casamento.quemPediu
    ) {

        try {

            foto =
                await client.getProfilePicUrl(
                    casamento.quemPediu
                );

        } catch (erro) {

            console.log(
                '⚠️ Não foi possível obter a foto de quem fez o pedido:',
                erro.message
            );
        }
    }

    // ============================================================
    // 📤 ENVIAR FAMÍLIA
    // ============================================================

    if (foto) {

        try {

            const imagem =
                await MessageMedia.fromUrl(
                    foto
                );

            await responderComMencoes(
                message,
                imagem,
                undefined,
                {
                    caption: textoFamilia,
                    mentions: mencoes
                }
            );

            return;

        } catch (erro) {

            console.log(
                '⚠️ Erro ao enviar foto da família:',
                erro.message
            );
        }
    }

    // Caso não tenha foto disponível
    await responderComMencoes(
        message,
        textoFamilia,
        undefined,
        {
            mentions: mencoes
        }
    );
}

// ============================================================
// 💍 ACEITAR PROPOSTA DE CASAMENTO
// ============================================================

async function aceitarCasamento(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // ============================================================
    // PROCURAR PROPOSTA
    // ============================================================

    let proposta = null;
    let chaveProposta = null;

    // Primeiro tenta pelo ID exato
    if (
        propostasCasamento.has(
            idRemetente
        )
    ) {

        proposta =
            propostasCasamento.get(
                idRemetente
            );

        chaveProposta =
            idRemetente;
    }

    // Se não encontrou, procura entre todas as propostas
    if (!proposta) {

        const idsRemetente =
            await obterIdsPessoa(
                idRemetente
            );

        for (
            const [
                chave,
                propostaAtual
            ]
            of propostasCasamento
        ) {

            const idsDestinatario =
                await obterIdsPessoa(
                    propostaAtual.para
                );

            let encontrou = false;

            for (
                const id1
                of idsRemetente
            ) {

                for (
                    const id2
                    of idsDestinatario
                ) {

                    if (
                        idsIguais(
                            id1,
                            id2
                        )
                    ) {

                        encontrou = true;
                        break;
                    }
                }

                if (encontrou) {
                    break;
                }
            }

            if (encontrou) {

                proposta =
                    propostaAtual;

                chaveProposta =
                    chave;

                break;
            }
        }
    }

    // ============================================================
    // NENHUMA PROPOSTA
    // ============================================================

    if (!proposta) {

        console.log(
            '❌ Nenhuma proposta encontrada para:',
            idRemetente
        );

        console.log(
            '💌 PROPOSTAS ATUAIS:',
            [...propostasCasamento]
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Você não possui nenhuma proposta de casamento pendente._'
        );

        return;
    }

    // ============================================================
    // DADOS DO CASAMENTO
    // ============================================================

    const idPessoaQuePediu =
        proposta.de;

    // ============================================================
    // VERIFICAR SE ALGUM DOS DOIS JÁ ESTÁ CASADO
    // ============================================================

    if (
        casamentos.has(
            idRemetente
        ) ||
        casamentos.has(
            idPessoaQuePediu
        )
    ) {

        propostasCasamento.delete(
            chaveProposta
        );

        salvarPropostasCasamento();

        await reagir(
            message,
            '💍'
        );

        await responderCitando(
            message,
            '💍 _Não foi possível concluir o casamento porque uma das pessoas já está casada._'
        );

        return;
    }

    // ============================================================
    // REALIZAR CASAMENTO
    // ============================================================

    const dataCasamento =
    new Date().toISOString();

casamentos.set(
    idRemetente,
    {
        parceiro: idPessoaQuePediu,
        desde: dataCasamento,
        quemPediu: idPessoaQuePediu
    }
);

casamentos.set(
    idPessoaQuePediu,
    {
        parceiro: idRemetente,
        desde: dataCasamento,
        quemPediu: idPessoaQuePediu
    }
);

    salvarCasamentos();
    salvarPropostasCasamento();

    // ============================================================
    // MENSAGEM
    // ============================================================

    const mencaoPessoa =
        `@${String(idRemetente).split('@')[0]}`;

    const mencaoParceiro =
        `@${String(idPessoaQuePediu).split('@')[0]}`;

    await reagir(
        message,
        '💍'
    );

    await responderCitando(
        message,
        `┏═•❃༺💍༻❃•═┓
│   *💍 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐎!*
├✯
├➤ ${mencaoPessoa} e ${mencaoParceiro}
│   _agora estão oficialmente casados!_ 💕
│
├➤ 💍 Que comece a vida a dois!
│
┗═•❃༺💍༻❃•═┛`,
        {
            mentions: [
                idRemetente,
                idPessoaQuePediu
            ]
        }
    );
}


// ============================================================
// 💔 RECUSAR PROPOSTA DE CASAMENTO
// ============================================================

async function recusarCasamento(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // ============================================================
    // PROCURAR PROPOSTA
    // ============================================================

    let proposta = null;
    let chaveProposta = null;

    // Primeiro tenta pelo ID exato
    if (
        propostasCasamento.has(
            idRemetente
        )
    ) {

        proposta =
            propostasCasamento.get(
                idRemetente
            );

        chaveProposta =
            idRemetente;
    }

    // Se não encontrou, procura entre todas as propostas
    if (!proposta) {

        const idsRemetente =
            await obterIdsPessoa(
                idRemetente
            );

        for (
            const [
                chave,
                propostaAtual
            ]
            of propostasCasamento
        ) {

            const idsDestinatario =
                await obterIdsPessoa(
                    propostaAtual.para
                );

            let encontrou = false;

            for (
                const id1
                of idsRemetente
            ) {

                for (
                    const id2
                    of idsDestinatario
                ) {

                    if (
                        idsIguais(
                            id1,
                            id2
                        )
                    ) {

                        encontrou = true;
                        break;
                    }
                }

                if (encontrou) {
                    break;
                }
            }

            if (encontrou) {

                proposta =
                    propostaAtual;

                chaveProposta =
                    chave;

                break;
            }
        }
    }

    // ============================================================
    // NENHUMA PROPOSTA
    // ============================================================

    if (!proposta) {

        console.log(
            '❌ Nenhuma proposta encontrada para:',
            idRemetente
        );

        console.log(
            '💌 PROPOSTAS ATUAIS:',
            [...propostasCasamento]
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            '❌ _Você não possui nenhuma proposta de casamento pendente._'
        );

        return;
    }

    // ============================================================
    // DADOS
    // ============================================================

    const idPessoaQuePediu =
        proposta.de;

    // ============================================================
    // REMOVER PROPOSTA
    // ============================================================

    propostasCasamento.delete(
        chaveProposta
    );

    salvarPropostasCasamento();

    // ============================================================
    // MENSAGEM
    // ============================================================

    const mencaoPessoa =
        `@${String(idRemetente).split('@')[0]}`;

    const mencaoParceiro =
        `@${String(idPessoaQuePediu).split('@')[0]}`;

    await reagir(
        message,
        '💔'
    );

    await responderCitando(
        message,
        `┏═•❃༺💔༻❃•═┓
│   *💔 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐑𝐄𝐂𝐔𝐒𝐀𝐃𝐀*
├✯
├➤ ${mencaoPessoa} recusou
│   _a proposta de ${mencaoParceiro}._
│
├➤ _Talvez na próxima..._ 🥲
│
┗═•❃༻❃•═┛`,
        {
            mentions: [
                idRemetente,
                idPessoaQuePediu
            ]
        }
    );
}

async function formarCasalAleatorio(message) {

    // ============================================================
    // 👥 VERIFICAR SE É GRUPO
    // ============================================================

    if (
        !message.from.endsWith('@g.us')
    ) {

        await message.react('❌');

        await message.reply(
            '❌ Esse comando só pode ser usado em grupos!'
        );

        return;
    }

    // ============================================================
    // 👥 PEGAR PARTICIPANTES REGISTRADOS
    // ============================================================

    const participantes =
        participantesGrupos.get(
            message.from
        );

    if (
        !participantes ||
        participantes.size < 2
    ) {

        await message.reply(
            '❌ Ainda não conheço pessoas suficientes desse grupo para formar um casal!\n\n' +
            '💡 Peça para pelo menos 2 pessoas enviarem uma mensagem primeiro.'
        );

        return;
    }

    const pessoas =
        [...participantes];

    console.log(
        '💘 PESSOAS DISPONÍVEIS PARA SORTEIO:',
        pessoas
    );

    // ============================================================
    // 🎲 ESCOLHER DUAS PESSOAS
    // ============================================================

    const indice1 =
        Math.floor(
            Math.random() *
            pessoas.length
        );

    let indice2 =
        Math.floor(
            Math.random() *
            pessoas.length
        );

    while (
        indice2 === indice1
    ) {

        indice2 =
            Math.floor(
                Math.random() *
                pessoas.length
            );
    }

    const pessoa1 =
        pessoas[indice1];

    const pessoa2 =
        pessoas[indice2];

    // ============================================================
    // 💘 PORCENTAGEM
    // ============================================================

    const porcentagem =
        Math.floor(
            Math.random() * 101
        );

    // ============================================================
    // 💕 MENÇÕES
    // ============================================================

    const mencao1 =
        `@${pessoa1.split('@')[0]}`;

    const mencao2 =
        `@${pessoa2.split('@')[0]}`;

    // ============================================================
    // 💘 RESULTADO
    // ============================================================

    await responderComMencoes(
        message,
        `┏═•❃༺💘༻❃•═┓
│   *💘 𝐂𝐀𝐒𝐀𝐋 𝐃𝐎 𝐃𝐈𝐀*
├✯
├➤ ${mencao1} ❤️ ${mencao2}
│
├➤ 💞 Compatibilidade: *${porcentagem}%*
│
┗═•❃༺💘༻❃•═┛`,
        undefined,
        {
            mentions: [
                pessoa1,
                pessoa2
            ]
        }
    );
}

async function shiparPessoas(message) {

    // ============================================================
    // 💘 VERIFICAR SE É GRUPO
    // ============================================================

    if (
        !message.from.endsWith('@g.us')
    ) {

        await message.react('❌');

        await message.reply(
            '❌ Esse comando só pode ser usado em grupos!'
        );

        return;
    }


    // ============================================================
    // 👥 PEGAR AS PESSOAS MENCIONADAS
    // ============================================================

    const mencionados = [...new Set(message.mentionedIds || [])];
    const pessoas = [...mencionados];

    if (pessoas.length < 2 && message.hasQuotedMsg) {
        try {
            const mensagemCitada = await message.getQuotedMessage();
            const idCitado = mensagemCitada?.author || mensagemCitada?.from || null;
            if (idCitado && idCitado !== message.from && !pessoas.includes(idCitado)) {
                pessoas.push(idCitado);
            }
        } catch (erro) {
            console.log('⚠️ Erro ao obter pessoa citada no ship:', erro.message);
        }
    }


    // ============================================================
    // ❌ VERIFICAR QUANTIDADE
    // ============================================================

    if (
        pessoas.length !== 2
    ) {

        await message.reply(
            '❌ Você precisa mencionar exatamente 2 pessoas!\n\n' +
            '💡 Exemplo:\n' +
            '`;shipar`\n' +
            '@Pessoa1\n' +
            '@Pessoa2'
        );

        return;
    }


    // ============================================================
    // 🚫 IMPEDIR SHIP CONSIGO MESMO
    // ============================================================

    if (
        pessoas[0] === pessoas[1]
    ) {

        await message.reply(
            '❌ Você não pode shipar a mesma pessoa com ela mesma! 😂'
        );

        return;
    }


    // ============================================================
    // 💘 PORCENTAGEM
    // ============================================================

    const porcentagem =
        Math.floor(
            Math.random() * 101
        );


    // ============================================================
    // 💕 MENÇÕES
    // ============================================================

    const mencao1 =
        `@${pessoas[0].split('@')[0]}`;

    const mencao2 =
        `@${pessoas[1].split('@')[0]}`;


    // ============================================================
    // 💘 RESULTADO
    // ============================================================

    await responderComMencoes(
        message,
        `┏═•❃༺💘༻❃•═┓
│   *💘 𝐒𝐇𝐈𝐏 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎*
├✯
├➤ ${mencao1} ❤️ ${mencao2}
│
├➤ 💞 Compatibilidade: *${porcentagem}%*
│
┗═•❃༺💘༻❃•═┛`,
        undefined,
        {
            mentions: pessoas
        }
    );
}

// ============================================================
// 💤 SISTEMA AFK
// ============================================================

function obterChaveAFK(message, idUsuario) {

    return `${message.from}_${idUsuario}`;

}


// ============================================================
// ⏱️ FORMATAR TEMPO DE AFK
// ============================================================

function formatarTempoAFK(inicio) {

    const tempo =
        Date.now() - inicio;

    let restante =
        tempo;

    const dias =
        Math.floor(
            restante / 86400000
        );

    restante %= 86400000;

    const horas =
        Math.floor(
            restante / 3600000
        );

    restante %= 3600000;

    const minutos =
        Math.floor(
            restante / 60000
        );

    restante %= 60000;

    const segundos =
        Math.floor(
            restante / 1000
        );

    const milissegundos =
        restante % 1000;


    const partes = [];


    if (dias > 0) {

        partes.push(
            `${dias} dia${dias !== 1 ? 's' : ''}`
        );

    }


    if (horas > 0) {

        partes.push(
            `${horas} hora${horas !== 1 ? 's' : ''}`
        );

    }


    if (minutos > 0) {

        partes.push(
            `${minutos} minuto${minutos !== 1 ? 's' : ''}`
        );

    }


    if (segundos > 0) {

        partes.push(
            `${segundos} segundo${segundos !== 1 ? 's' : ''}`
        );

    }


    if (
        partes.length === 0 ||
        milissegundos > 0
    ) {

        partes.push(
            `${milissegundos} milissegundo${milissegundos !== 1 ? 's' : ''}`
        );

    }


    return partes.join(', ');

}


// ============================================================
// ⏱️ FORMATAR TEMPO CURTO
// ============================================================

function formatarTempoAFKCurto(inicio) {

    const tempo =
        Date.now() - inicio;

    let restante =
        tempo;

    const dias =
        Math.floor(
            restante / 86400000
        );

    restante %= 86400000;

    const horas =
        Math.floor(
            restante / 3600000
        );

    restante %= 3600000;

    const minutos =
        Math.floor(
            restante / 60000
        );

    restante %= 60000;

    const segundos =
        Math.floor(
            restante / 1000
        );


    const partes = [];


    if (dias > 0) {

        partes.push(
            `${dias}d`
        );

    }

    if (horas > 0) {

        partes.push(
            `${horas}h`
        );

    }

    if (minutos > 0) {

        partes.push(
            `${minutos}m`
        );

    }

    if (segundos > 0) {

        partes.push(
            `${segundos}s`
        );

    }


    if (partes.length === 0) {

        return 'menos de 1s';

    }


    return partes.join(' ');

}


// ============================================================
// 🌎 SAUDAÇÃO
// ============================================================

function obterSaudacao() {

    const hora =
        new Date().getHours();


    if (
        hora >= 5 &&
        hora < 12
    ) {

        return 'Bom dia';

    }


    if (
        hora >= 12 &&
        hora < 18
    ) {

        return 'Boa tarde';

    }


    return 'Boa noite';

}


// ============================================================
// 👤 OBTER ID DO USUÁRIO
// ============================================================

function obterIdAFK(message) {

    return (
        message.author ||
        message.from
    );

}


// ============================================================
// 💤 ATIVAR AFK
// ============================================================

async function ativarAFK(
    message,
    motivo
) {

    // AFK só funciona em grupos
    if (
        !message.from.endsWith('@g.us')
    ) {

        await responderCitando(
            message,
            `╭━━━〔 💤 𝐌𝐎𝐃𝐎 𝐀𝐅𝐊 〕━━━╮
│
│ ❌ *Disponível apenas em grupos*
│
│ O modo AFK não pode ser utilizado
│ em conversas privadas.
│
╰━━━━━━━━━━━━━━━━━━━━╯`
        );

        return;

    }


    const idUsuario =
        obterIdAFK(message);


    if (!idUsuario) {

        return;

    }


    const chave =
        obterChaveAFK(
            message,
            idUsuario
        );


    // ========================================================
    // 🔄 JÁ ESTÁ AFK
    // ========================================================

    if (
        usuariosAFK.has(chave)
    ) {

        const dados =
            usuariosAFK.get(chave);


        dados.motivo =
            motivo ||
            'Sem motivo informado.';


        await responderCitando(
            message,
            `╭━━━〔 💤 𝐀𝐅𝐊 𝐀𝐓𝐈𝐕𝐎 〕━━━╮
│
│ ⚠️ Você já estava em AFK.
│
│ 📝 *Motivo atualizado:*
│ ➜ _${dados.motivo}_
│
╰━━━━━━━━━━━━━━━━━━━━╯
💡 _Seu motivo foi atualizado com sucesso._`
        );

        return;

    }


    // ========================================================
    // 💤 SALVAR AFK
    // ========================================================

    usuariosAFK.set(
        chave,
        {
            motivo:
                motivo ||
                'Sem motivo informado.',

               

            inicio:
                Date.now(),

            idUsuario
        }
    );

    salvarAFK();


    // ========================================================
    // 📢 CONFIRMAÇÃO
    // ========================================================

    await responderCitando(
        message,
        `╭━━━〔 💤 𝐀𝐅𝐊 𝐀𝐓𝐈𝐕𝐀𝐃𝐎 〕━━━╮
│
│ 👤 *Usuário:* Você
│ 📝 *Motivo:* _${motivo || 'Sem motivo informado.'}_
│ 💤 *Status:* Ausente
│
╰━━━━━━━━━━━━━━━━━━━━╯

💡 _Envie qualquer mensagem para encerrar seu AFK._`
    );

}


// ============================================================
// 👋 REMOVER AFK
// ============================================================

async function removerAFK(
    message,
    dados
) {

    const tempo =
        formatarTempoAFK(
            dados.inicio
        );


    const saudacao =
        obterSaudacao();


    let nome =
        'Usuário';


    try {

        const contato =
            await message.getContact();


        nome =
            contato.pushname ||
            contato.name ||
            contato.number ||
            'Usuário';

    } catch (erro) {

        console.log(
            '⚠️ Não foi possível obter nome do usuário AFK:',
            erro.message
        );

    }


    await responderCitando(
        message,
        `╭━━━〔 👋 𝐀𝐅𝐊 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐎 〕━━━╮
│
│ 🌙 *${saudacao}, ${nome}!*
│
│ ⏱️ *Tempo ausente:*
│ ➜ ${tempo}
│
│ 📝 *Motivo:*
│ ➜ _${dados.motivo}_
│
│ ✅ *Status:* Online
│
╰━━━━━━━━━━━━━━━━━━━━╯
_Que bom que você voltou! 👋_`
    );

}


async function adicionarBlacklist(
    message,
    argumento
) {

    const permitido =
        await exigirAdmin(message);

    if (!permitido) {
        return;
    }

    let pessoa = null;
    let idPessoa = null;
    let idsPessoa = new Set();

    // ============================================================
    // 1. TENTAR ENCONTRAR POR MENÇÃO
    // ============================================================

    const mencoes =
        await message.getMentions();

    if (
        mencoes &&
        mencoes.length > 0
    ) {

        pessoa = mencoes[0];

        idPessoa =
            idDaPessoa(pessoa);

        console.log(
            '🚫 PESSOA MENCIONADA:',
            idPessoa
        );

        // Pega TODOS os IDs possíveis da pessoa
        idsPessoa =
            await obterIdsPessoa(pessoa);
    }

    // ============================================================
    // 2. TENTAR ENCONTRAR PELA MENSAGEM RESPONDIDA
    // ============================================================

    if (
        !idPessoa &&
        message.hasQuotedMsg
    ) {

        try {

            const mensagemAlvo =
                await message.getQuotedMessage();

            if (mensagemAlvo) {

                idPessoa =
                    mensagemAlvo.author ||
                    mensagemAlvo.from ||
                    null;

                console.log(
                    '🚫 PESSOA RESPONDIDA:',
                    idPessoa
                );

                if (idPessoa) {

                    idsPessoa =
                        await obterIdsPessoa(
                            idPessoa
                        );
                }
            }

        } catch (erro) {

            console.log(
                '⚠️ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. USAR NÚMERO INFORMADO MANUALMENTE
    // ============================================================

    if (!idPessoa) {

        const numero =
            argumento.replace(
                /\D/g,
                ''
            );

        if (!numero) {

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `❌ *𝐏𝐄𝐒𝐒𝐎𝐀 𝐍𝐀̃𝐎 𝐈𝐃𝐄𝐍𝐓𝐈𝐅𝐈𝐂𝐀𝐃𝐀.*

_Use uma menção, responda à mensagem da pessoa ou informe o número._

_Exemplos:_

*${PREFIXO}muteblacklist @pessoa*

ou responda à mensagem com:

*${PREFIXO}muteblacklist*

ou:

*${PREFIXO}muteblacklist 5513982293975*`
            );

            return;
        }

        idPessoa =
            `${numero}@c.us`;

        idsPessoa =
            await obterIdsPessoa(
                idPessoa
            );
    }

    // ============================================================
    // 4. GARANTIR QUE O ID PRINCIPAL TAMBÉM SEJA ADICIONADO
    // ============================================================

    if (idPessoa) {

        idsPessoa.add(
            idPessoa
        );
    }

    // ============================================================
    // 5. ADICIONAR TODOS OS IDs À BLACKLIST
    // ============================================================

    if (
        idsPessoa.size === 0
    ) {

        idsPessoa.add(
            idPessoa
        );
    }

    console.log(
        '🚫 IDs DA PESSOA NA BLACKLIST:'
    );

    for (
        const id of idsPessoa
    ) {

        blacklistMute.add(
            id
        );

        console.log(
            '   🚫',
            id
        );
    }

    // ============================================================
    // 6. RESPOSTA
    // ============================================================

    await reagir(
        message,
        '🚫'
    );

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓*
├✯
├➤ _A pessoa foi adicionada à_
│   _lista negra de mute._
│
├➤ _Ela será silenciada em todos_
│   _os grupos onde o bot estiver._
│
┗═•❃༺✿༻❃•═┛`
    );
}

// ============================================================
// 💀 COMANDO SUICÍDIO
// ============================================================

async function suicidio(message) {

    if (!message.from.endsWith('@g.us')) {

        await message.react('❌');

        await message.reply(
            '❌ Esse comando só pode ser usado em grupos!'
        );

        return;
    }

    const idUsuario =
        obterIdRemetente(message);

    if (!idUsuario) {

        await message.reply(
            '❌ Não consegui identificar você!'
        );

        return;
    }

    try {

        // ========================================================
        // OBTER GRUPO DIRETAMENTE PELO WAWebCollections
        // ========================================================

        const resultado =
            await client.pupPage.evaluate(
                (chatId, usuarioId) => {

                    try {

                        const Store =
                            window.require(
                                'WAWebCollections'
                            );

                        if (
                            !Store ||
                            !Store.Chat
                        ) {

                            return {
                                sucesso: false,
                                erro: 'Store.Chat não encontrado.'
                            };
                        }

                        const chat =
                            Store.Chat.get(chatId);

                        if (!chat) {

                            return {
                                sucesso: false,
                                erro: 'Grupo não encontrado.'
                            };
                        }

                        const participantes =
                            chat.groupMetadata?.participants;

                        if (!participantes) {

                            return {
                                sucesso: false,
                                erro: 'Participantes do grupo não encontrados.'
                            };
                        }

                        // Verificar se o usuário realmente está no grupo
                        let modelos = [];

                        if (
                            typeof participantes.getModelsArray ===
                            'function'
                        ) {

                            modelos =
                                participantes.getModelsArray();

                        } else if (
                            Array.isArray(
                                participantes.models
                            )
                        ) {

                            modelos =
                                participantes.models;
                        }

                        const participante =
                            modelos.find(
                                p =>
                                    p.id?._serialized ===
                                    usuarioId
                            );

                        if (!participante) {

                            return {
                                sucesso: false,
                                erro: 'Usuário não encontrado no grupo.'
                            };
                        }

                        return {
                            sucesso: true,

                            chatId,

                            usuarioId:

                                participante.id?._serialized ||
                                null,

                            isAdmin:
                                !!participante.isAdmin,

                            isSuperAdmin:
                                !!participante.isSuperAdmin
                        };

                    } catch (erro) {

                        return {
                            sucesso: false,

                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )
                        };
                    }

                },
                message.from,
                idUsuario
            );

        // ========================================================
        // VERIFICAR RESULTADO
        // ========================================================

        if (
            !resultado ||
            !resultado.sucesso
        ) {

            console.error(
                '❌ ERRO AO LOCALIZAR USUÁRIO:',
                resultado?.erro
            );

            await message.reply(
                '❌ Não consegui localizar você neste grupo.'
            );

            return;
        }

        console.log(
            '💀 USUÁRIO LOCALIZADO:',
            resultado.usuarioId
        );

        // ========================================================
        // REMOVER PARTICIPANTE
        // ========================================================

       const remocao =
    await client.pupPage.evaluate(
        async (chatId, idUsuario) => {

            try {

                const Store =
                    window.require(
                        'WAWebCollections'
                    );

                const chat =
                    Store.Chat.get(chatId);

                if (!chat) {
                    return {
                        sucesso: false,
                        erro: 'Grupo não encontrado.'
                    };
                }

                const participantes =
                    chat.groupMetadata?.participants;

                if (!participantes) {
                    return {
                        sucesso: false,
                        erro: 'Participantes não encontrados.'
                    };
                }

                let participante = null;

                // 🔎 Procurar pelo ID do usuário
                if (
                    typeof participantes.get ===
                    'function'
                ) {

                    participante =
                        participantes.get(
                            idUsuario
                        );

                }

                // 🔎 Caso não encontre pelo ID direto
                if (!participante) {

                    let modelos = [];

                    if (
                        typeof participantes.getModelsArray ===
                        'function'
                    ) {

                        modelos =
                            participantes.getModelsArray();

                    } else if (
                        Array.isArray(
                            participantes.models
                        )
                    ) {

                        modelos =
                            participantes.models;
                    }

                    participante =
                        modelos.find(
                            p =>
                                p.id?._serialized ===
                                idUsuario
                        );
                }

                if (!participante) {
                    return {
                        sucesso: false,
                        erro:
                            'Participante não encontrado.'
                    };
                }

                const ModifyParticipants =
                    window.require(
                        'WAWebModifyParticipantsGroupAction'
                    );

                // 🚪 REMOVER O PARTICIPANTE
                await ModifyParticipants.removeParticipants(
                    chat,
                    [participante]
                );

                return {
                    sucesso: true
                };

            } catch (erro) {

                return {
                    sucesso: false,
                    erro:
                        String(
                            erro?.message ||
                            erro
                        )
                };
            }

        },
        message.from,
        idUsuario
    );

console.log(
    '🚪 RESULTADO DA REMOÇÃO:',
    JSON.stringify(
        remocao,
        null,
        2
    )
);

        // ========================================================
        // RESULTADO DA REMOÇÃO
        // ========================================================

        if (
            !remocao ||
            !remocao.sucesso
        ) {

            console.error(
                '❌ ERRO AO REMOVER:',
                remocao?.erro
            );

            await message.reply(
                '❌ Não consegui te remover do grupo.\n\n' +
                '👑 Verifique se o JUST BOT continua sendo administrador.'
            );

            return;
        }

        // ========================================================
        // SUCESSO
        // ========================================================

        await message.reply(
            '💀 Mais um para lista!'
        );

    } catch (erro) {

        console.error(
            '❌ ERRO NO COMANDO SUICIDIO:',
            erro
        );

        await message.reply(
            '❌ Ocorreu um erro ao executar o comando.'
        );
    }
}

// ============================================================
// 😂 MANDAR PIADA
// ============================================================

async function mandarPiada(message) {

    if (
        piadas.length === 0
    ) {

        await reagir(
            message,
            '😂'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐀𝐈𝐍𝐃𝐀 𝐍𝐀̃𝐎 𝐓𝐄𝐌𝐎𝐒 𝐏𝐈𝐀𝐃𝐀𝐒!*
│
│  Use o futuro comando:
│  *${PREFIXO}addpiada*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    const indice =
        Math.floor(
            Math.random() * piadas.length
        );

    const piada =
        piadas[indice];

    await reagir(
        message,
        '😂'
    );

    await responderCitando(
        message,
        `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀 𝐃𝐎 𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
│
├➤ ${piada}
│
┗═•❃༺😂༻❃•═┛`
    );
}

// ============================================================
// ➕ ADICIONAR PIADA
// ============================================================

async function adicionarPiada(message, argumento) {

    const piada =
        argumento.trim();

    if (!piada) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐑 𝐏𝐈𝐀𝐃𝐀*
│
├➤ Você precisa escrever
│   uma piada depois do comando.
│
│  💡 Exemplo:
│  *${PREFIXO}addpiada Sua piada aqui*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    piadas.push(
        piada
    );

    salvarPiadas();

    await reagir(
        message,
        '😂'
    );

    await responderCitando(
        message,
        `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀!*
│
├➤ ${piada}
│
├➤ 📚 Total de piadas:
│   *${piadas.length}*
│
┗═•❃༺😂༻❃•═┛`
    );
}

// ============================================================
// 📋 LISTAR PIADAS
// ============================================================

async function listarPiadas(message) {

    if (piadas.length === 0) {

        await reagir(
            message,
            '📋'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐏𝐈𝐀𝐃𝐀𝐒*
│
│  Ainda não existem piadas
│  cadastradas no JUST BOT.
│
│  💡 Use:
│  *${PREFIXO}addpiada texto*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    let lista =
        `┏═•❃༺😂༻❃•═┓
│    *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐏𝐈𝐀𝐃𝐀𝐒*
├✯
│
`;

    piadas.forEach(
        (piada, indice) => {

            lista +=
                `├➤ *${indice + 1}.* ${piada}\n│\n`;
        }
    );

    lista +=
        `├✯
│
│  📚 *Total:* ${piadas.length} piada${piadas.length === 1 ? '' : 's'}
│
┗═•❃༺😂༻❃•═┛`;

    await reagir(
        message,
        '📋'
    );

    await responderCitando(
        message,
        lista
    );
}

// ============================================================
// 🗑️ REMOVER PIADA
// ============================================================

async function removerPiada(message, argumento) {

    const numero =
        parseInt(
            argumento.trim()
        );

    if (
        isNaN(numero)
    ) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐏𝐈𝐀𝐃𝐀*
│
├➤ Informe o número da piada
│   que deseja remover.
│
│  💡 Exemplo:
│  *${PREFIXO}removerpiada 3*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    if (
        numero < 1 ||
        numero > piadas.length
    ) {

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐀*
│
├➤ Não existe uma piada
│   com o número *${numero}*.
│
│  📚 Total atual:
│   *${piadas.length}*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    const indice =
        numero - 1;

    const piadaRemovida =
        piadas[indice];

    piadas.splice(
        indice,
        1
    );

    salvarPiadas();

    await reagir(
        message,
        '🗑️'
    );

    await responderCitando(
        message,
        `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀!*
│
├➤ *${piadaRemovida}*
│
├➤ 📚 Piadas restantes:
│   *${piadas.length}*
│
┗═•❃༺😂༻❃•═┛`
    );
}

// ============================================================
// 🗑️ LIMPAR TODAS AS PIADAS
// ============================================================

async function limparPiadas(message) {

    if (piadas.length === 0) {

        await reagir(
            message,
            '😂'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐋𝐈𝐒𝐓𝐀 𝐉𝐀́ 𝐕𝐀𝐙𝐈𝐀*
│
│  Não existem piadas
│  cadastradas para apagar.
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    await reagir(
        message,
        '⚠️'
    );

    await responderCitando(
        message,
        `┏═•❃༺⚠️༻❃•═┓
│
│  *𝐋𝐈𝐌𝐏𝐀𝐑 𝐏𝐈𝐀𝐃𝐀𝐒*
│
├➤ Você está prestes a apagar
│   *TODAS* as piadas cadastradas.
│
│  📚 Total:
│   *${piadas.length} piada${piadas.length === 1 ? '' : 's'}*
│
│  *⚠️ 𝙀𝙨𝙨𝙖 𝙖çã𝙤 𝙣ã𝙤 𝙥𝙤𝙙𝙚 𝙨𝙚𝙧 
│ 𝙙𝙚𝙨𝙛𝙚𝙞𝙩𝙖 𝙖𝙪𝙩𝙤𝙢𝙖𝙩𝙞𝙘𝙖𝙢𝙚𝙣𝙩𝙚.*
│
│  Para confirmar, responda:
│
│  *𝑺𝑰𝑴*
│
│  Para cancelar, responda:
│
│  *𝑵Ã𝑶*
│
┗═•❃༺⚠️༻❃•═┛`
    );

    const chatId =
        message.from;

    const autor =
        message.author ||
        message.from;

    const chave =
        `${chatId}_${autor}`;

    confirmacoesLimparPiadas.set(
        chave,
        true
    );
}

// ============================================================
// 📄 CARREGAR PIADAS DE ARQUIVO
// ============================================================

async function carregarPiadas(message) {

    if (!message.hasMedia) {

        await reagir(
            message,
            '📄'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐑 𝐏𝐈𝐀𝐃𝐀𝐒*
│
├➤ Envie um arquivo *.txt*
│   contendo uma piada por linha.
│
│  💡 Exemplo:
│
│  Piada número 1
│  Piada número 2
│  Piada número 3
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    try {

        const midia =
            await message.downloadMedia();

        if (!midia) {
            throw new Error(
                'Arquivo não disponível.'
            );
        }

        if (
            midia.mimetype !==
            'text/plain'
        ) {

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `┏═•❃༺❌༻❃•═┓
│
│  *𝐀𝐑𝐐𝐔𝐈𝐕𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎*
│
├➤ O arquivo precisa ser
│   um *.txt*.
│
┗═•❃༺❌༻❃•═┛`
            );

            return;
        }

        const conteudo =
            Buffer.from(
                midia.data,
                'base64'
            ).toString(
                'utf8'
            );

        const novasPiadas =
            conteudo
                .split(/\r?\n/)
                .map(
                    linha => linha.trim()
                )
                .filter(
                    linha => linha.length > 0
                );

        if (
            novasPiadas.length === 0
        ) {

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `┏═•❃༺😂༻❃•═┓
│
│  *𝐀𝐑𝐐𝐔𝐈𝐕𝐎 𝐕𝐀𝐙𝐈𝐎*
│
├➤ Nenhuma piada foi
│   encontrada no arquivo.
│
┗═•❃༺😂༻❃•═┛`
            );

            return;
        }

        for (
            const piada of novasPiadas
        ) {

            piadas.push(
                piada
            );
        }

        salvarPiadas();

        await reagir(
            message,
            '✅'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀𝐒 𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐃𝐀𝐒!*
│
├➤ 📥 Adicionadas:
│   *${novasPiadas.length}*
│
├➤ 📚 Total agora:
│   *${piadas.length}*
│
┗═•❃༺😂༻❃•═┛`
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao carregar piadas:',
            erro
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐄𝐑𝐑𝐎 𝐀𝐎 𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐑*
│
├➤ Não foi possível ler
│   o arquivo de piadas.
│
┗═•❃༺😂༻❃•═┛`
        );
    }
}

// ============================================================
// 💘 COMANDO CANTADA
// ============================================================

async function mandarCantada(message) {

    const cantadasLeves = [

        '🌹 Você acredita em amor à primeira vista ou eu preciso passar aqui de novo?',

        '💘 Você não é Google, mas tem tudo que eu estava procurando.',

        '✨ Se beleza fosse tempo, você seria uma eternidade.',

        '🌹 Você tem mapa? Porque eu me perdi no seu sorriso.',

        '💫 Acho que meu Wi-Fi encontrou sua conexão.',

        '❤️ Eu não sou fotógrafo, mas consigo imaginar nós dois juntos.',

        '🌷 Seu sorriso devia ser considerado patrimônio mundial.',

        '💖 Você não é estrela, mas conseguiu iluminar meu dia.'

    ];

    const cantadasAtrevidas = [

        '😏 Eu ia fazer uma cantada inteligente, mas você me deixou sem raciocínio.',

        '🔥 Você sempre é assim ou resolveu ficar irresistível só hoje?',

        '😏 Se beleza desse cadeia, você já estaria cumprindo prisão perpétua.',

        '🔥 Eu tinha uma cantada perfeita, mas esqueci quando te vi.',

        '😏 Você é perigoso(a). Eu mal te conheço e já estou querendo te conhecer melhor.',

        '🔥 Se eu ganhasse R$1 toda vez que pensei em você, já estaria rico.',

        '😏 Você tem certeza que não é golpe? Porque parece bom demais para ser verdade.',

        '🔥 Acho que você acabou de transformar meu "oi" em interesse.'

    ];

    const todas =
        [
            ...cantadasLeves,
            ...cantadasAtrevidas
        ];

    const cantada =
        todas[
            Math.floor(
                Math.random() * todas.length
            )
        ];

    const pessoa = await obterPessoaMarcada(message);
    const idPessoa = idDaPessoa(pessoa);

    if (idPessoa) {
        await responderComMencoes(
            message,
            `💘 ${mencaoDaPessoa(pessoa)}\n\n${cantada}`,
            undefined,
            { mentions: [idPessoa] }
        );
        return;
    }

    await message.reply(cantada);
}


// ============================================================
// MENU JOGOS
// ============================================================
// ============================================================
// 🎰 SLOTS
// ============================================================

async function minerar(message) {
    try {
        const remetenteOriginal = obterIdRemetente(message);
        const usuarioId = await resolverIdEconomia(remetenteOriginal);
        if (!usuarioId) return;

        const agora = Date.now();
        const ultimo = cooldownsMineracao.get(usuarioId) || 0;
        const temPicareta = quantidadeItem(usuarioId, 'picareta') > 0;
        const intervalo = temPicareta ? 30 * 1000 : INTERVALO_MINERACAO;
        const restante = intervalo - (agora - ultimo);

        if (restante > 0) {
            const segundos = Math.ceil(restante / 1000);
            await reagir(message, '⏳');
            await responderCitando(message, `⏳ _Sua mina ainda está sendo preparada._\n\nTente novamente em *${segundos}s*.`);
            return;
        }

        cooldownsMineracao.set(usuarioId, agora);
        salvarMoedas();
        const carteira = garantirCarteira(usuarioId);
        const sorte = Math.random();
        let minerio;
        let emoji;
        let valor;

        if (sorte < 0.05) {
            minerio = 'Diamante'; emoji = '💎'; valor = Math.floor(Math.random() * 501) + 500;
        } else if (sorte < 0.20) {
            minerio = 'Ouro'; emoji = '🥇'; valor = Math.floor(Math.random() * 151) + 250;
        } else if (sorte < 0.50) {
            minerio = 'Prata'; emoji = '🥈'; valor = Math.floor(Math.random() * 71) + 120;
        } else {
            minerio = 'Carvão'; emoji = '🪨'; valor = Math.floor(Math.random() * 51) + 30;
        }

        if (temPicareta) valor = Math.floor(valor * 1.25);
        carteira.saldo += valor;
        carteira.mineracoes += 1;
        registrarTransacao('mineracao', null, usuarioId, valor, minerio);
        salvarMoedas();

        await reagir(message, emoji);
        await responderCitando(message, `┏═•❃༺⛏️༻❃•═┓
├✯ *𝐌𝐈𝐍𝐄𝐑𝐀𝐂̧𝐀̃𝐎*
│
├➤ ${emoji} Você encontrou *${minerio}*!
├➤ 🪙 Valor: *${formatarMoedas(valor)} moedas*
${temPicareta ? '├➤ ⛏️ Picareta Reforçada: *+25%*\n' : ''}│
├➤ 💰 Saldo: *${formatarMoedas(carteira.saldo)} moedas*
│
┗═•❃༺⛏️༻❃•═┛`);
    } catch (erro) {
        console.error('❌ Erro na mineração:', erro);
        await reagir(message, '❌');
    }
}

async function mostrarLoja(message) {
    let texto = `┏═•❃༺🏪༻❃•═┓
│      *𝐋𝐎𝐉𝐀 𝐉𝐔𝐒𝐓 𝐌𝐀𝐑𝐊𝐄𝐓*
├✯
│
`;
    for (const [id, item] of Object.entries(ITENS_LOJA)) {
        texto += `├➤ ${item.emoji} *${id}* — *${formatarMoedas(item.preco)} 🪙*\n│   _${item.descricao}_\n│\n`;
    }
    texto += `├✯
│
├➤ Comprar: *${PREFIXO}comprar <item>*
├➤ Exemplo: *${PREFIXO}comprar picareta*
│
┗═•❃༺🏪༻❃•═┛`;
    await reagir(message, '🏪');
    await responderCitando(message, texto);
}

async function comprarItem(message, argumentos) {
    const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
    const escolha = String(argumentos || '').trim().toLowerCase().split(/\s+/)[0];
    const item = ITENS_LOJA[escolha];

    if (!item) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Item inválido._ Use *${PREFIXO}loja* para ver os produtos.`);
        return;
    }

    const carteira = garantirCarteira(usuarioId);
    if (carteira.saldo < item.preco) {
        await reagir(message, '💸');
        await responderCitando(message, `💸 _Você precisa de *${formatarMoedas(item.preco)} moedas* para comprar ${item.emoji} ${item.nome}._\n\nSeu saldo: *${formatarMoedas(carteira.saldo)} moedas*.`);
        return;
    }

    carteira.saldo -= item.preco;
    adicionarItem(usuarioId, escolha);
    registrarTransacao('compra', usuarioId, null, item.preco, item.nome);
    salvarMoedas();

    await reagir(message, '🛒');
    await responderCitando(message, `┏═•❃༺🛒༻❃•═┓
├✯ *𝐂𝐎𝐌𝐏𝐑𝐀 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐀!*
│
├➤ ${item.emoji} *${item.nome}*
├➤ 🪙 Pago: *${formatarMoedas(item.preco)} moedas*
├➤ 📦 Quantidade: *${quantidadeItem(usuarioId, escolha)}x*
│
├➤ 💰 Saldo: *${formatarMoedas(carteira.saldo)} moedas*
│
┗═•❃༺🛒༻❃•═┛`);
}

async function mostrarInventario(message) {
    const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
    garantirCarteira(usuarioId);
    let texto = `┏═•❃༺🎒༻❃•═┓
├✯ *𝐒𝐄𝐔 𝐈𝐍𝐕𝐄𝐍𝐓𝐀́𝐑𝐈𝐎*
│
`;
    for (const [id, item] of Object.entries(ITENS_LOJA)) {
        texto += `├➤ ${item.emoji} *${item.nome}*: ${quantidadeItem(usuarioId, id)}x\n`;
    }
    texto += `│
┗═•❃༺🎒༻❃•═┛`;
    await reagir(message, '🎒');
    await responderCitando(message, texto);
}

async function mostrarSaldo(message) {
    try {
        const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
        if (!usuarioId) return;
        const carteira = garantirCarteira(usuarioId);
        salvarMoedas();
        await reagir(message, '💰');
        await responderCitando(message, `┏═•❃༺💰༻❃•═┓
│       *𝐒𝐄𝐔 𝐒𝐀𝐋𝐃𝐎*
├✯
│
├➤ 🪙 *${formatarMoedas(carteira.saldo)} moedas*
│
├➤ ⛏️ Minerações: *${carteira.mineracoes}*
├➤ 🥷 Roubos bem-sucedidos: *${carteira.roubosSucesso}*
│
├➤ ⛏️ *${PREFIXO}minerar*
├➤ 🏪 *${PREFIXO}loja*
├➤ 🎰 *${PREFIXO}slots 100*
│
┗═•❃༺💰༻❃•═┛`);
    } catch (erro) {
        console.error('❌ Erro ao mostrar saldo:', erro);
    }
}

async function jogarSlots(message, argumento) {
    try {
        const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
        const argumentoLimpo = String(argumento || '').trim();
        if (!usuarioId || !/^\d+$/.test(argumentoLimpo)) {
            await reagir(message, '❌');
            await responderCitando(message, `❌ _Informe uma aposta inteira válida._\n\nA aposta mínima é *10 moedas*.\nExemplo: *${PREFIXO}slots 100*`);
            return;
        }

        const aposta = Number(argumentoLimpo);
        if (!Number.isSafeInteger(aposta) || aposta < 10) {
            await reagir(message, '❌');
            await responderCitando(message, `❌ _A aposta deve ser um número inteiro entre *10* e *${formatarMoedas(Number.MAX_SAFE_INTEGER)}* moedas._`);
            return;
        }

        const carteira = garantirCarteira(usuarioId);
        if (aposta > carteira.saldo) {
            await reagir(message, '💸');
            await responderCitando(message, `💸 _Saldo insuficiente._\n\nAposta: *${formatarMoedas(aposta)}*\nSaldo: *${formatarMoedas(carteira.saldo)}*`);
            return;
        }

        carteira.saldo -= aposta;
        registrarTransacao('slots_aposta', usuarioId, null, aposta, 'Aposta nos slots');

        const simbolos = ['🍒','🍋','🍉','🔔','⭐','💎','7️⃣'];
        const rolos = [0,1,2].map(() => simbolos[Math.floor(Math.random() * simbolos.length)]);
        let multiplicador = 0;

        if (rolos.every(s => s === '7️⃣')) multiplicador = 50;
        else if (rolos.every(s => s === '💎')) multiplicador = 25;
        else if (rolos.every(s => s === '⭐')) multiplicador = 15;
        else if (rolos.every(s => s === '🔔')) multiplicador = 10;
        else if (rolos.every(s => s === '🍉')) multiplicador = 7;
        else if (rolos.every(s => s === '🍋')) multiplicador = 5;
        else if (rolos.every(s => s === '🍒')) multiplicador = 3;
        else if (rolos[0] === rolos[1] || rolos[1] === rolos[2] || rolos[0] === rolos[2]) multiplicador = 2;

        const premio = aposta * multiplicador;
        if (!Number.isSafeInteger(premio)) {
            console.error('❌ Prêmio dos slots excedeu o limite seguro:', { aposta, multiplicador });
            carteira.saldo += aposta;
            historicoEconomia.pop();
            salvarMoedas();
            await reagir(message, '❌');
            await responderCitando(message, '❌ _Não foi possível processar essa aposta com segurança. Suas moedas foram devolvidas._');
            return;
        }

        carteira.saldo += premio;
        if (premio > 0) {
            registrarTransacao('slots_premio', null, usuarioId, premio, `Prêmio dos slots: ${rolos.join(' ')}, ${multiplicador}x`);
        }
        salvarMoedas();

        await reagir(message, multiplicador ? '🎉' : '🎰');
        await responderCitando(message, `┏═•❃༺🎰༻❃•═┓\n│      *𝐉𝐔𝐒𝐓 𝐒𝐋𝐎𝐓𝐒*\n├✯\n│\n│      ${rolos.join(' │ ')}\n│\n├➤ 🎲 Aposta: *${formatarMoedas(aposta)}*\n├➤ 🎉 Multiplicador: *${multiplicador}x*\n├➤ 🪙 Prêmio: *${formatarMoedas(premio)}*\n├➤ 💰 Saldo: *${formatarMoedas(carteira.saldo)}*\n│\n┗═•❃༺🎰༻❃•═┛`);
    } catch (erro) {
        console.error('❌ Erro nos slots:', erro);
        await reagir(message, '❌');
    }
}

async function doarMoedas(message, argumentos) {
    const remetente = await resolverIdEconomia(obterIdRemetente(message));
    const pessoa = await exigirPessoa(message);
    if (!pessoa) return;
    const destinatario = await resolverIdEconomia(pessoa);
    const partes = String(argumentos || '').trim().split(/\s+/);
    const valorTexto = partes[0] || '';
    if (!/^\d+$/.test(valorTexto)) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe um valor inteiro válido._\n\nExemplo: *${PREFIXO}doar 500 @fulano*`);
        return;
    }
    const valor = Number(valorTexto);

    if (!Number.isSafeInteger(valor) || valor <= 0) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe um valor válido._\n\nExemplo: *${PREFIXO}doar 500 @fulano*`);
        return;
    }

    if (idsIguais(remetente, destinatario)) {
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Você não pode doar para si mesmo._');
        return;
    }

    const carteira = garantirCarteira(remetente);
    if (carteira.saldo < valor) {
        await reagir(message, '💸');
        await responderCitando(message, `💸 _Você não possui moedas suficientes._\n\nSeu saldo: *${formatarMoedas(carteira.saldo)}*\nValor: *${formatarMoedas(valor)}*`);
        return;
    }

    const antesRemetente = carteira.saldo;
    if (!transferirMoedas(remetente, destinatario, valor, 'doacao', 'Doação entre usuários')) return;
    const saldoDestinatario = garantirCarteira(destinatario).saldo;
    const hora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await reagir(message, '💸');
    await responderCitando(message, `┏═•❃༺💸༻❃•═┓
│       *𝐂𝐎𝐌𝐏𝐑𝐎𝐕𝐀𝐍𝐓𝐄 𝐃𝐄 𝐃𝐎𝐀𝐂̧𝐀̃𝐎*
├✯
│
├➤ 👤 De: *${mencaoDaPessoa(remetente)}*
├➤ 🎁 Para: *${mencaoDaPessoa(pessoa)}*
├➤ 🪙 Valor: *${formatarMoedas(valor)} moedas*
│
├➤ 💰 Saldo após envio: *${formatarMoedas(antesRemetente - valor)}*
├➤ 💰 Saldo do destinatário: *${formatarMoedas(saldoDestinatario)}*
├➤ 🕐 Horário: *${hora}*
│
├✯ *𝐓𝐑𝐀𝐍𝐒𝐀𝐂̧𝐀̃𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐀* ✅
┗═•❃༺💸༻❃•═┛`, { mentions: [remetente, destinatario] });
}

async function sortearMoedas(message, argumentos) {
    if (!(await exigirAdmin(message))) return;
    const valorTexto = String(argumentos || '').trim();
    if (!/^\d+$/.test(valorTexto)) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe um valor inteiro válido._\n\nExemplo: *${PREFIXO}sortearm 500*`);
        return;
    }
    const valor = Number(valorTexto);
    if (!Number.isSafeInteger(valor) || valor <= 0) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Informe o valor do sorteio._\n\nExemplo: *${PREFIXO}sortearm 500*`);
        return;
    }
    if (!message.from.endsWith('@g.us')) {
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Esse comando só funciona em grupos._');
        return;
    }

    const dados = await client.pupPage.evaluate(async (chatId, botId) => {
        try {
            const Store = window.require('WAWebCollections');
            const chat = Store.Chat.get(chatId);
            const participantes = chat?.groupMetadata?.participants;
            let modelos = [];
            if (participantes?.getModelsArray) modelos = participantes.getModelsArray();
            else if (Array.isArray(participantes?.models)) modelos = participantes.models;
            const jogadores = modelos
                .map(p => ({ id: p.id?._serialized || p.id?.toString?.(), admin: !!p.isAdmin || !!p.isSuperAdmin }))
                .filter(p => p.id && p.id !== botId && !p.admin)
                .map(p => p.id);
            return { jogadores };
        } catch (erro) {
            return { erro: String(erro?.message || erro) };
        }
    }, message.from, client.info?.wid?._serialized || null);

    if (dados.erro || !dados.jogadores?.length) {
        await reagir(message, '❌');
        await responderCitando(message, `❌ _Não encontrei participantes elegíveis para o sorteio._`);
        return;
    }

    const vencedorOriginal = dados.jogadores[Math.floor(Math.random() * dados.jogadores.length)];
    const vencedor = await resolverIdEconomia(vencedorOriginal);
    const carteira = garantirCarteira(vencedor);
    carteira.saldo += valor;
    registrarTransacao('sorteio_admin', null, vencedor, valor, `Sorteio realizado por administrador ${obterIdRemetente(message)}`);
    salvarMoedas();
    const hora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await reagir(message, '🎉');
    await enviarComMencoes(message.from, `┏═•❃༺🎉༻❃•═┓
│       *𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐃𝐄 𝐌𝐎𝐄𝐃𝐀𝐒*
├✯
│
├➤ 🎯 O vencedor é *${mencaoDaPessoa(vencedor)}*!
├➤ 🪙 Prêmio: *${formatarMoedas(valor)} moedas*
├➤ 🕐 Horário: *${hora}*
│
├➤ 👑 Sorteio criado por um administrador.
├➤ 💰 As moedas foram geradas pelo bot.
│
┗═•❃༺🎉༻❃•═┛`, { mentions: [vencedor] });
}

async function rankingDinheiro(message) {
    if (!message.from.endsWith('@g.us')) {
        await reagir(message, '❌');
        await responderCitando(message, '❌ _O ranking de moedas só funciona em grupos._');
        return;
    }

    const dados = await client.pupPage.evaluate(async chatId => {
        try {
            const Store = window.require('WAWebCollections');
            const chat = Store.Chat.get(chatId);
            const participantes = chat?.groupMetadata?.participants;
            let modelos = [];
            if (participantes?.getModelsArray) modelos = participantes.getModelsArray();
            else if (Array.isArray(participantes?.models)) modelos = participantes.models;
            return modelos.map(p => p.id?._serialized || p.id?.toString?.()).filter(Boolean);
        } catch (erro) { return []; }
    }, message.from);

    const idsEconomia = [];
    for (const id of (dados || [])) {
        const resolvido = await resolverIdEconomia(id);
        if (resolvido) idsEconomia.push(resolvido);
    }

    const lista = [...new Set(idsEconomia)]
        .map(id => ({ id, carteira: obterCarteiraEconomia(id) }))
        .filter(item => item.carteira)
        .map(item => ({ id: item.id, saldo: item.carteira.saldo }))
        .sort((a,b) => b.saldo - a.saldo || a.id.localeCompare(b.id)).slice(0,10);

    const eu = await resolverIdEconomia(obterIdRemetente(message));
    const posicao = [...new Set(idsEconomia)]
        .map(id => ({ id, carteira: obterCarteiraEconomia(id) }))
        .filter(item => item.carteira)
        .map(item => ({ id: item.id, saldo: item.carteira.saldo }))
        .sort((a,b) => b.saldo - a.saldo || a.id.localeCompare(b.id)).findIndex(x => idsIguais(x.id, eu)) + 1;

    let texto = `┏═•❃༺🏆༻❃•═┓
│    *𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐄 𝐌𝐎𝐄𝐃𝐀𝐒*
├✯
│
`;
    const medalhas = ['🥇','🥈','🥉'];
    lista.forEach((item, i) => {
        texto += `├➤ ${medalhas[i] || `${i+1}º`} *${mencaoDaPessoa(item.id)}* — *${formatarMoedas(item.saldo)} 🪙*\n`;
    });
    texto += `│
├➤ 📍 Sua posição: *${posicao > 0 ? `${posicao}º` : 'fora do ranking'}*
│
┗═•❃༺🏆༻❃•═┛`;
    await reagir(message, '🏆');
    await enviarComMencoes(message.from, texto, { mentions: lista.map(x => x.id) });
}

// ============================================================
// 🥔 BATATA QUENTE / 🔫 ROLETA RUSSA
// ============================================================

async function obterJogadoresParaEliminacao(message) {
    if (!message.from || !message.from.endsWith('@g.us')) {
        return { erro: 'Esse jogo só pode ser usado em grupos.' };
    }

    try {
        const dados = await client.pupPage.evaluate(
            async (chatId, botId) => {
                try {
                    const Store = window.require('WAWebCollections');
                    const chat = Store.Chat.get(chatId);

                    if (!chat) {
                        return { erro: 'Grupo não encontrado.' };
                    }

                    const participantes = chat.groupMetadata?.participants;
                    if (!participantes) {
                        return { erro: 'Participantes não encontrados.' };
                    }

                    let modelos = [];
                    if (typeof participantes.getModelsArray === 'function') {
                        modelos = participantes.getModelsArray();
                    } else if (Array.isArray(participantes.models)) {
                        modelos = participantes.models;
                    }

                    const jogadores = modelos
                        .map(p => ({
                            id: p.id?._serialized || p.id?.toString?.() || null,
                            isAdmin: !!p.isAdmin,
                            isSuperAdmin: !!p.isSuperAdmin
                        }))
                        .filter(p =>
                            p.id &&
                            p.id !== botId &&
                            !p.isAdmin &&
                            !p.isSuperAdmin
                        )
                        .map(p => p.id);

                    return { jogadores };
                } catch (erro) {
                    return {
                        erro: String(erro?.message || erro)
                    };
                }
            },
            message.from,
            client.info?.wid?._serialized || null
        );

        if (!dados || dados.erro) {
            return {
                erro: dados?.erro || 'Não consegui obter os participantes.'
            };
        }

        return { jogadores: dados.jogadores || [] };
    } catch (erro) {
        console.error('❌ Erro ao obter jogadores do jogo:', erro);
        return { erro: String(erro?.message || erro) };
    }
}

async function expulsarJogadorDoGrupo(message, idUsuario) {
    try {
        const resultado = await client.pupPage.evaluate(
            async (chatId, idUsuario) => {
                try {
                    const Store = window.require('WAWebCollections');
                    const chat = Store.Chat.get(chatId);

                    if (!chat) {
                        return { sucesso: false, erro: 'Grupo não encontrado.' };
                    }

                    const participantes = chat.groupMetadata?.participants;
                    if (!participantes) {
                        return { sucesso: false, erro: 'Participantes não encontrados.' };
                    }

                    let participante = null;
                    if (typeof participantes.get === 'function') {
                        participante = participantes.get(idUsuario);
                    }

                    if (!participante) {
                        let modelos = [];
                        if (typeof participantes.getModelsArray === 'function') {
                            modelos = participantes.getModelsArray();
                        } else if (Array.isArray(participantes.models)) {
                            modelos = participantes.models;
                        }

                        participante = modelos.find(p =>
                            p.id?._serialized === idUsuario
                        );
                    }

                    if (!participante) {
                        return {
                            sucesso: false,
                            erro: 'Participante não encontrado.'
                        };
                    }

                    if (participante.isAdmin || participante.isSuperAdmin) {
                        return {
                            sucesso: false,
                            erro: 'O participante é administrador.'
                        };
                    }

                    const ModifyParticipants =
                        window.require('WAWebModifyParticipantsGroupAction');

                    await ModifyParticipants.removeParticipants(
                        chat,
                        [participante]
                    );

                    return { sucesso: true };
                } catch (erro) {
                    return {
                        sucesso: false,
                        erro: String(erro?.message || erro)
                    };
                }
            },
            message.from,
            idUsuario
        );

        return resultado || {
            sucesso: false,
            erro: 'Resposta vazia da remoção.'
        };
    } catch (erro) {
        console.error('❌ Erro ao expulsar jogador:', erro);
        return {
            sucesso: false,
            erro: String(erro?.message || erro)
        };
    }
}

async function jogarBatataQuente(message) {
    try {
        if (!message.from.endsWith('@g.us')) {
            await reagir(message, '❌');
            await message.reply('❌ A batata quente só pode ser jogada em grupos!');
            return;
        }

        const jogadores = await obterJogadoresParaEliminacao(message);
        if (jogadores.erro) {
            await reagir(message, '❌');
            await message.reply(`❌ ${jogadores.erro}`);
            return;
        }

        if (jogadores.jogadores.length < 2) {
            await reagir(message, '❌');
            await message.reply(
                '❌ Preciso de pelo menos *2 participantes que não sejam administradores* para jogar a batata quente!'
            );
            return;
        }

        const azarado =
            jogadores.jogadores[Math.floor(Math.random() * jogadores.jogadores.length)];

        jogosEliminacao.set(message.from, {
            tipo: 'batata',
            jogador: azarado,
            criadoEm: Date.now()
        });

        const mencao = `@${String(azarado).split('@')[0]}`;

        await reagir(message, '🥔');
        await enviarComMencoes(
            message.from,
            `┏═•❃༺🥔༻❃•═┓\n│\n│  *𝐁𝐀𝐓𝐀𝐓𝐀 𝐐𝐔𝐄𝐍𝐓𝐄!*\n│\n├➤ A batata passou de mão em mão...\n├➤ E explodiu na mão de *${mencao}*! 💥\n│\n└➤ *${mencao} foi expulso do grupo!*\n┗═•❃༺🥔༻❃•═┛`,
            { mentions: [azarado] }
        );

        await new Promise(resolve => setTimeout(resolve, 1200));

        const remocao = await expulsarJogadorDoGrupo(message, azarado);
        jogosEliminacao.delete(message.from);

        if (!remocao.sucesso) {
            await enviarComMencoes(
                message.from,
                `⚠️ A batata acertou em cheio, mas não consegui expulsar @${String(azarado).split('@')[0]}.\n\n❌ ${remocao.erro}`,
                { mentions: [azarado] }
            );
        }
    } catch (erro) {
        jogosEliminacao.delete(message.from);
        console.error('❌ ERRO NA BATATA QUENTE:', erro);
        await message.reply('❌ Ocorreu um erro ao jogar a batata quente.');
    }
}

async function jogarRoletaRussa(message) {
    try {
        if (!message.from.endsWith('@g.us')) {
            await reagir(message, '❌');
            await message.reply('❌ A roleta russa só pode ser usada em grupos!');
            return;
        }

        // 🔐 Verificação padrão de administrador
        // Usa o mesmo sistema dos outros comandos de administração.
        if (!(await exigirAdmin(message))) {
            return;
        }

        const jogadores = await obterJogadoresParaEliminacao(message);
        if (jogadores.erro) {
            await reagir(message, '❌');
            await message.reply(`❌ ${jogadores.erro}`);
            return;
        }

        if (jogadores.jogadores.length < 2) {
            await reagir(message, '❌');
            await message.reply(
                '❌ Preciso de pelo menos *2 participantes que não sejam administradores* para girar a roleta russa!'
            );
            return;
        }

        const azarado =
            jogadores.jogadores[Math.floor(Math.random() * jogadores.jogadores.length)];

        jogosEliminacao.set(message.from, {
            tipo: 'rr',
            jogador: azarado,
            criadoEm: Date.now()
        });

        const mencao = `@${String(azarado).split('@')[0]}`;

        await reagir(message, '🔫');
        await enviarComMencoes(
            message.from,
            `┏═•❃༺🔫༻❃•═┓\n│\n│  *𝐑𝐎𝐋𝐄𝐓𝐀 𝐑𝐔𝐒𝐒𝐀!*\n│\n├➤ A roleta girou... 🔄\n├➤ O destino escolheu *${mencao}*! 💀\n│\n└➤ *${mencao} foi expulso do grupo!*\n┗═•❃༺🔫༻❃•═┛`,
            { mentions: [azarado] }
        );

        await new Promise(resolve => setTimeout(resolve, 1200));

        const remocao = await expulsarJogadorDoGrupo(message, azarado);
        jogosEliminacao.delete(message.from);

        if (!remocao.sucesso) {
            await enviarComMencoes(
                message.from,
                `⚠️ A roleta escolheu @${String(azarado).split('@')[0]}, mas não consegui expulsá-lo.\n\n❌ ${remocao.erro}`,
                { mentions: [azarado] }
            );
        }
    } catch (erro) {
        jogosEliminacao.delete(message.from);
        console.error('❌ ERRO NA ROLETA RUSSA:', erro);
        await message.reply('❌ Ocorreu um erro ao girar a roleta russa.');
    }
}

async function menuJogos(message) {

    await reagir(
        message,
        '🎮'
    );

    await responderCitando(
        message,
        `┏═•❃༺🎮༻❃•═┓
│
│      *🎮 𝐉𝐎𝐆𝐎𝐒*
│
├✯
│
├➤ 🎲 *${PREFIXO}dado*
│   _Rola um dado_
│
├➤ 🪙 *${PREFIXO}moeda*
│   _Cara ou coroa_
│
├➤ 🔮 *${PREFIXO}sn*
│   _Sim ou não_
│
├➤ ✂️ *${PREFIXO}ppt*
│   _Pedra, papel ou tesoura_
│
├➤ 🔢 *${PREFIXO}adivinha*
│   _Adivinhe o número_
│
├➤ 🎯 *${PREFIXO}chute @pessoa*
│   _Desafie alguém_
│
├➤ ❤️ *${PREFIXO}ppp @pessoa*
│   _Pega, pensa ou passa?_
│
├➤ ⛏️ *${PREFIXO}minerar*
│   _Minerar e ganhar moedas_
│
├➤ 🏪 *${PREFIXO}loja*
│   _Ver a loja de itens_
│
├➤ 🛒 *${PREFIXO}comprar <item>*
│   _Comprar um item_
│
├➤ 🎒 *${PREFIXO}inventario*
│   _Ver seus itens_
│
├➤ 🎰 *${PREFIXO}slots 100*
│   _Aposte suas moedas_
│
├➤ 💰 *${PREFIXO}saldo*
│   _Ver sua carteira_
│
├➤ 💸 *${PREFIXO}doar 500 @pessoa*
│   _Transferir moedas para alguém_
│
├➤ 🏆 *${PREFIXO}rankingdinheiro*
│   _Ver os mais ricos do grupo_
│
├➤ 🎉 *${PREFIXO}sortearm 500*
│   _Sorteio de moedas para admins_
│
│
├➤ 🥔 *${PREFIXO}batata*
│   _Escolha aleatoriamente quem será expulso_
│
├➤ 🔫 *${PREFIXO}rr*
│   _Roleta russa: alguém será expulso_
│
┗═•❃༺🎮༻❃•═┛`
    );
}

// ============================================================
// 🔔 EXIGIR ADMIN PARA AVISOS
// ============================================================

async function exigirAdminAviso(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE É GRUPO
        // ========================================================

        if (
            !chatId ||
            !chatId.endsWith('@g.us')
        ) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺🔔༻❃•═┓
├✯ *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎*
│
├➤ _Esse comando só funciona em grupos._
│
┗═•❃༺🔔༻❃•═┛`
            );

            return false;
        }

        // ========================================================
        // OBTER DADOS DO GRUPO
        // ========================================================

        const dadosChat =
            await client.pupPage.evaluate(
                (chatId) => {

                    try {

                        const Store =
                            window.require(
                                'WAWebCollections'
                            );

                        if (
                            !Store ||
                            !Store.Chat
                        ) {
                            return {
                                erro:
                                    'Coleções do WhatsApp não disponíveis.'
                            };
                        }

                        const chat =
                            Store.Chat.get(chatId);

                        if (!chat) {
                            return {
                                erro:
                                    'Grupo não encontrado.'
                            };
                        }

                        const participantes =
                            chat.groupMetadata?.participants;

                        if (!participantes) {
                            return {
                                erro:
                                    'Participantes não encontrados.'
                            };
                        }

                        let modelos = [];

                        if (
                            typeof participantes.getModelsArray ===
                            'function'
                        ) {

                            modelos =
                                participantes.getModelsArray();

                        } else if (
                            Array.isArray(
                                participantes.models
                            )
                        ) {

                            modelos =
                                participantes.models;
                        }

                        return {

                            participants:
                                modelos.map(
                                    participante => ({

                                        id:
                                            participante.id?._serialized ||
                                            participante.id?.toString?.() ||
                                            null,

                                        isAdmin:
                                            !!participante.isAdmin,

                                        isSuperAdmin:
                                            !!participante.isSuperAdmin

                                    })
                                )

                        };

                    } catch (erro) {

                        return {

                            erro:
                                String(
                                    erro?.message ||
                                    erro
                                )

                        };
                    }

                },
                chatId
            );

        // ========================================================
        // ERRO AO OBTER GRUPO
        // ========================================================

        if (
            !dadosChat ||
            dadosChat.erro
        ) {

            console.error(
                '❌ Erro ao obter dados do grupo:',
                dadosChat?.erro
            );

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺⚠️༻❃•═┓
├✯ *𝐄𝐑𝐑𝐎 𝐀𝐎 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐑*
│
├➤ _Não foi possível verificar_
│   _as permissões do grupo._
│
┗═•❃༺⚠️༻❃•═┓`
            );

            return false;
        }

        // ========================================================
        // VERIFICAR ADMIN DO USUÁRIO
        // ========================================================

        const idRemetente =
            obterIdRemetente(message);

        console.log(
            '========== 🔔 ADMIN AVISO =========='
        );

        console.log(
            'REMETENTE:',
            idRemetente
        );

        console.log(
            'PARTICIPANTES:',
            JSON.stringify(
                dadosChat.participants,
                null,
                2
            )
        );

        console.log(
            '===================================='
        );

        const participanteUsuario =
            dadosChat.participants.find(
                participante =>
                    participante.id &&
                    idRemetente &&
                    idsIguais(
                        participante.id,
                        idRemetente
                    )
            );

        const usuarioAdmin =
            !!(
                participanteUsuario &&
                (
                    participanteUsuario.isAdmin ||
                    participanteUsuario.isSuperAdmin
                )
            );

        // ========================================================
        // USUÁRIO NÃO É ADMIN
        // ========================================================

        if (!usuarioAdmin) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺🚫༻❃•═┓
├✯ *𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎*
│
├➤ _Você precisa ser administrador_
│   _para gerenciar os avisos._
│
┗═•❃༺🚫༻❃•═┓`
            );

            return false;
        }

        // ========================================================
        // USUÁRIO É ADMIN
        // ========================================================

        console.log(
            '✅ USUÁRIO É ADMINISTRADOR!'
        );

        return true;

    } catch (erro) {

        console.error(
            '❌ Erro ao verificar administrador:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            `┏═•❃༺⚠️༻❃•═┓
├✯ *𝐄𝐑𝐑𝐎*
│
├➤ _Não foi possível verificar_
│   _suas permissões._
│
├➤ _Tente novamente em alguns segundos._
│
┗═•❃༺⚠️༻❃•═┓`
        );

        return false;
    }
}

function obterDataHoraSaoPaulo() {
    const agora = new Date();

    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(agora);

    const valores = {};

    for (const parte of partes) {
        valores[parte.type] = parte.value;
    }

    return {
        data: `${valores.year}-${valores.month}-${valores.day}`,
        hora: `${valores.hour}:${valores.minute}`
    };
}

async function adicionarAviso(message, argumentos) {
    if (!(await exigirAdminAviso(message))) return;

    const texto = String(argumentos || '').trim();

    const separador = texto.indexOf('/');

    if (separador === -1) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🔔 *NOVO AVISO* 〕
│
│ ❌ Formato inválido!
│
│ Use:
│ *;aviso HH:MM / mensagem*
│
│ Exemplo:
│ *;aviso 12:30 / Hora do almoço*
│
╰────────────────`
        );

        return;
    }

    const hora = texto.slice(0, separador).trim();
    const mensagem = texto.slice(separador + 1).trim();

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🔔 *NOVO AVISO* 〕
│
│ ❌ *Horário inválido!*
│
│ Use o formato:
│ *HH:MM*
│
│ Exemplo:
│ *12:30*
│
╰────────────────`
        );

        return;
    }

    if (!mensagem) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🔔 *NOVO AVISO* 〕
│
│ ❌ Você precisa informar
│ a mensagem do aviso.
│
│ Exemplo:
│ *;aviso 12:30 / Hora do almoço*
│
╰────────────────`
        );

        return;
    }

    if (!avisos.has(message.from)) {
        avisos.set(message.from, []);
    }

    const lista = avisos.get(message.from);

    const novoAviso = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        hora,
        mensagem,
        ultimoEnvio: null
    };

    lista.push(novoAviso);

    lista.sort((a, b) => a.hora.localeCompare(b.hora));

    salvarAvisos();

    await reagir(message, '🔔');

    await responderCitando(
        message,
        `╭─〔 🔔 *𝐀𝐕𝐈𝐒𝐎 𝐀𝐆𝐄𝐍𝐃𝐀𝐃𝐎* 〕
│
│ ✅ *𝑨𝒗𝒊𝒔𝒐 𝒄𝒓𝒊𝒂𝒅𝒐 𝒄𝒐𝒎 𝒔𝒖𝒄𝒆𝒔𝒔𝒐!*
│
│ 🕐 𝐇𝐨𝐫á𝐫𝐢𝐨: *${hora}*
│ 💬 𝑴𝒆𝒏𝒔𝒂𝒈𝒆𝒎: *${mensagem}*
│ 🔁 𝑹𝒆𝒑𝒆𝒕𝒊çã𝒐: *Diariamente*
│
╰────────────────`
    );
}

async function removerAviso(message, argumentos) {
    if (!(await exigirAdminAviso(message))) return;

    const hora = String(argumentos || '').trim();

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ ❌ Horário inválido!
│
│ Use:
│ *;rem_aviso HH:MM*
│
│ Exemplo:
│ *;rem_aviso 12:30*
│
╰────────────────`
        );

        return;
    }

    const lista = avisos.get(message.from) || [];

    const encontrados = lista.filter(aviso => aviso.hora === hora);

    if (encontrados.length === 0) {
        await reagir(message, '📭');

        await responderCitando(
            message,
            `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ 📭 Nenhum aviso encontrado
│ para o horário *${hora}*.
│
╰────────────────`
        );

        return;
    }

    // Se houver apenas um aviso nesse horário
    if (encontrados.length === 1) {
        const indice = lista.findIndex(
            aviso => aviso.id === encontrados[0].id
        );

        const removido = lista.splice(indice, 1)[0];

        if (lista.length === 0) {
            avisos.delete(message.from);
        }

        salvarAvisos();

        await reagir(message, '🗑️');

        await responderCitando(
            message,
            `╭─〔 🗑️ *𝑨𝑽𝑰𝑺𝑶 𝑹𝑬𝑴𝑶𝑽𝑰𝑫𝑶* 〕
│
│ ✅ *𝑨𝒗𝒊𝒔𝒐 𝒓𝒆𝒎𝒐𝒗𝒊𝒅𝒐 𝒄𝒐𝒎 𝒔𝒖𝒄𝒆𝒔𝒔𝒐!*
│
│ 🕐 𝐇𝐨𝐫á𝐫𝐢𝐨: *${removido.hora}*
│ 💬  𝑴𝒆𝒏𝒔𝒂𝒈𝒆𝒎: *${removido.mensagem}*
│
╰────────────────`
        );

        return;
    }

    // Mais de um aviso no mesmo horário
    const chave = `${message.from}_${obterIdRemetente(message)}`;

    confirmacoesRemoverAviso.set(chave, {
        hora,
        ids: encontrados.map(aviso => aviso.id)
    });

    let resposta = `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ ⚠️ Existem *${encontrados.length} avisos*
│ cadastrados para *${hora}*.
│
│ Escolha qual deseja remover:
│
`;

    encontrados.forEach((aviso, index) => {
        resposta += `│ *${index + 1}.* 💬 ${aviso.mensagem}
│
`;
    });

    resposta += `│ ─────────────────
│
│ 👉 Responda apenas com o
│ número do aviso.
│
│ Exemplo: *1*
│
╰────────────────`;

    await responderCitando(message, resposta);
}

async function processarSelecaoRemoverAviso(message) {
    const idRemetente = obterIdRemetente(message);
    const chave = `${message.from}_${idRemetente}`;

    const pendencia = confirmacoesRemoverAviso.get(chave);

    if (!pendencia) {
        return false;
    }

    // Se o usuário quiser executar outro comando,
    // deixa o processamento normal continuar.
    if (message.body.trim().startsWith(PREFIXO)) {
        return false;
    }

    const texto = message.body.trim();

    if (texto.toLowerCase() === 'cancelar') {
        confirmacoesRemoverAviso.delete(chave);

        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ ❌ *Operação cancelada.*
│
╰────────────────`
        );

        return true;
    }

    const numero = Number(texto);

    if (
        !Number.isInteger(numero) ||
        numero < 1 ||
        numero > pendencia.ids.length
    ) {
        await responderCitando(
            message,
            `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ ❌ Opção inválida!
│
│ Responda com um número
│ entre *1* e *${pendencia.ids.length}*.
│
│ Ou envie *cancelar*.
│
╰────────────────`
        );

        return true;
    }

    if (!(await exigirAdminAviso(message))) {
        return true;
    }

    const idSelecionado = pendencia.ids[numero - 1];

    const lista = avisos.get(message.from) || [];

    const indice = lista.findIndex(
        aviso => aviso.id === idSelecionado
    );

    confirmacoesRemoverAviso.delete(chave);

    if (indice === -1) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `╭─〔 🗑️ *REMOVER AVISO* 〕
│
│ ❌ Esse aviso não existe mais.
│
╰────────────────`
        );

        return true;
    }

    const removido = lista.splice(indice, 1)[0];

    if (lista.length === 0) {
        avisos.delete(message.from);
    }

    salvarAvisos();

    await reagir(message, '🗑️');

    await responderCitando(
        message,
        `╭─〔 🗑️ *AVISO REMOVIDO* 〕
│
│ ✅ *Aviso removido com sucesso!*
│
│ 🕐 Horário: *${removido.hora}*
│ 💬 Mensagem: *${removido.mensagem}*
│
╰────────────────`
    );

    return true;
}

function fonteEstilizada(texto) {
    const normal =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const estilizado =
        '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉' +
        '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣' +
        '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿';

    const mapa = {};

    for (let i = 0; i < normal.length; i++) {
        mapa[normal[i]] = estilizado[i];
    }

    return String(texto || '')
        .split('')
        .map(caractere => mapa[caractere] || caractere)
        .join('');
}

async function listarAvisos(message) {

    if (!(await exigirAdminAviso(message))) {
        return;
    }

    const grupoId = message.from;
    const lista = avisos.get(grupoId) || [];

    if (lista.length === 0) {

        await reagir(message, '🔔');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *🔔 𝑨𝑽𝑰𝑺𝑶𝑺 𝑷𝑹𝑶𝑮𝑹𝑨𝑴𝑨𝑫𝑶𝑺*
│
├➤ _𝑵ã𝒐 𝒉á 𝒂𝒗𝒊𝒔𝒐𝒔 𝒑𝒓𝒐𝒈𝒓𝒂𝒎𝒂𝒅𝒐𝒔._
│
┗═•❃༺✿༻❃•═┓`
        );

        return;
    }

    const avisosOrdenados = [...lista].sort((a, b) =>
        a.hora.localeCompare(b.hora)
    );

    let texto = `┏═•❃༺✿༻❃•═┓
├✯ *🔔 𝑨𝑽𝑰𝑺𝑶𝑺 𝑷𝑹𝑶𝑮𝑹𝑨𝑴𝑨𝑫𝑶𝑺*
│
`;

    avisosOrdenados.forEach((aviso, index) => {

        texto += `├➤ *${index + 1}. ⏰ ${aviso.hora}*
│   ↳ *${aviso.mensagem}*
│
`;
    });

    texto += `┗═•❃༺✿༻❃•═┓`;

    await reagir(message, '🔔');

    await responderCitando(
        message,
        texto
    );
}

async function jogoPPP(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE É GRUPO
        // ========================================================

        if (!chatId || !chatId.endsWith('@g.us')) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐏𝐄𝐆𝐀, 𝐏𝐄𝐍𝐒𝐀 𝐎𝐔 𝐏𝐀𝐒𝐒𝐀*
│
├➤ _Esse jogo só funciona em grupos._
│
┗═•❃༺✿༻❃•═┓`
            );

            return;
        }

        // ========================================================
        // OBTER PARTICIPANTES
        // ========================================================

        const participantes =
            await client.pupPage.evaluate((chatId) => {

                try {

                    const Store =
                        window.require('WAWebCollections');

                    const chat =
                        Store.Chat.get(chatId);

                    if (!chat) {
                        return [];
                    }

                    const lista =
                        chat.groupMetadata?.participants;

                    if (!lista) {
                        return [];
                    }

                    let modelos = [];

                    if (
                        typeof lista.getModelsArray ===
                        'function'
                    ) {

                        modelos =
                            lista.getModelsArray();

                    } else if (
                        Array.isArray(lista.models)
                    ) {

                        modelos =
                            lista.models;
                    }

                    return modelos.map(participante => ({
                        id:
                            participante.id?._serialized ||
                            participante.id?.toString?.() ||
                            null,

                        isMe:
                            !!participante.isMe
                    }));

                } catch (erro) {

                    console.error(
                        '❌ Erro ao obter participantes do PPP:',
                        erro
                    );

                    return [];
                }

            }, chatId);

        // ========================================================
        // VERIFICAR PARTICIPANTES
        // ========================================================

        if (
            !participantes ||
            participantes.length === 0
        ) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐏𝐄𝐆𝐀, 𝐏𝐄𝐍𝐒𝐀 𝐎𝐔 𝐏𝐀𝐒𝐒𝐀*
│
├➤ _Não consegui encontrar os participantes._
│
┗═•❃༺✿༻❃•═┓`
            );

            return;
        }

        // ========================================================
        // REMOVER O BOT
        // ========================================================

        const disponiveis =
            participantes.filter(
                participante =>
                    participante.id &&
                    !participante.isMe
            );

        if (disponiveis.length === 0) {

            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐏𝐄𝐆𝐀, 𝐏𝐄𝐍𝐒𝐀 𝐎𝐔 𝐏𝐀𝐒𝐒𝐀*
│
├➤ _Não há participantes disponíveis._
│
┗═•❃༺✿༻❃•═┓`
            );

            return;
        }

        // ========================================================
        // SORTEAR PARTICIPANTE
        // ========================================================

        const escolhido =
            disponiveis[
                Math.floor(
                    Math.random() * disponiveis.length
                )
            ];

        const idEscolhido =
            escolhido.id;

        // ========================================================
        // MONTAR MENÇÃO
        // ========================================================

        const numeroMencao =
            idEscolhido.split('@')[0];

        await reagir(message, '🎯');
        // ========================================================
        // ENVIAR MENSAGEM
        // ========================================================

        const textoPPP = `┏═•❃༺✿༻❃•═┓
├✯ *𝐏𝐄𝐆𝐀, 𝐏𝐄𝐍𝐒𝐀 𝐎𝐔 𝐏𝐀𝐒𝐒𝐀*
│
├➤ @${numeroMencao}
│
┗═•❃༺✿༻❃•═┓`;

        // Envia a mensagem do PPP
        await enviarComMencoes(
            chatId,
            textoPPP,
            {
                quotedMessageId: message.id._serialized,
                mentions: [idEscolhido]
            }
        );

        // Pequena espera para o WhatsApp registrar a mensagem
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Procura a mensagem enviada pelo bot
        const mensagemPPP = await client.pupPage.evaluate(
            (chatId, textoPPP) => {
                try {
                    const Store = window.require('WAWebCollections');

                    const chat = Store.Chat.get(chatId);

                    if (!chat) return null;

                    const mensagens = chat.msgs;

                    if (!mensagens) return null;

                    let modelos = [];

                    if (typeof mensagens.getModelsArray === 'function') {
                        modelos = mensagens.getModelsArray();
                    } else if (Array.isArray(mensagens.models)) {
                        modelos = mensagens.models;
                    }

                    // Procura a mensagem mais recente com o texto do PPP
                    for (let i = modelos.length - 1; i >= 0; i--) {
                        const msg = modelos[i];

                        if (msg.body === textoPPP && msg.id) {
                            return {
                                id:
                                    msg.id._serialized ||
                                    msg.id.toString?.() ||
                                    null
                            };
                        }
                    }

                    return null;

                } catch (erro) {
                    console.error(
                        '❌ Erro ao localizar mensagem PPP:',
                        erro
                    );

                    return null;
                }
            },
            chatId,
            textoPPP
        );

        console.log(
            '🎯 ID DA MENSAGEM PPP:',
            mensagemPPP
        );

        if (!mensagemPPP || !mensagemPPP.id) {
            throw new Error(
                'Não foi possível localizar o ID da mensagem do PPP.'
            );
        }

        // Cria a enquete
   const enquete =
            new Poll(
                '𝐏𝐞𝐠𝐚, 𝐩𝐞𝐧𝐬𝐚 𝐨𝐮 𝐩𝐚𝐬𝐬𝐚?',
                [
                    '❤️ 𝐏𝐞𝐠𝐚',
                    '💭 𝐏𝐞𝐧𝐬𝐚',
                    '❌ 𝐏𝐚𝐬𝐬𝐚'
                ],
                {
                    allowMultipleAnswers: false
                }
            );

        // Envia a enquete respondendo à mensagem do PPP
        await client.sendMessage(
            chatId,
            enquete,
            {
                quotedMessageId: mensagemPPP.id
            }
        );

    } catch (erro) {
        console.error(
            '❌ Erro no jogo PPP:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *𝐏𝐄𝐆𝐀, 𝐏𝐄𝐍𝐒𝐀 𝐎𝐔 𝐏𝐀𝐒𝐒𝐀*
│
├➤ _Ocorreu um erro ao realizar o sorteio._
│
┗═•❃༺✿༻❃•═┓`
        );
    }
}

async function comandoOiAuto(message) {
    try {
        const chatId = message.from;

        // Só funciona em grupos
        if (!chatId || !chatId.endsWith('@g.us')) {
            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐎𝐈 𝐀𝐔𝐓𝐎*
│
├➤ _Esse comando só funciona em grupos._
│
┗═•❃༺✿༻❃•═┓`
            );

            return;
        }

        // Verifica se quem usou é administrador
        if (!(await exigirAdmin(message))) {
            await reagir(message, '❌');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐎𝐈 𝐀𝐔𝐓𝐎*
│
├➤ _Apenas administradores podem usar esse comando._
│
┗═•❃༺✿༻❃•═┓`
            );

            return;
        }

        // Verifica o estado atual
        const ativo = oiAutoAtivo.get(chatId) === true;

        // ========================================================
        // 🔴 DESATIVAR
        // ========================================================

        if (ativo) {

            oiAutoAtivo.delete(chatId);

            salvarOiAuto();

            await reagir(message, '🔴');

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐎𝐈 𝐀𝐔𝐓𝐎*
│
├➤ 🔴 _Comando desativado!_
│
├➤ O bot não responderá mais automaticamente.
│
┗═•❃༺✿༻❃•═┓`
            );

        // ========================================================
        // 🟢 ATIVAR
        // ========================================================

        } else {

            oiAutoAtivo.set(
                chatId,
                true
            );

            salvarOiAuto();

            await reagir(message, '🟢');

            await enviarComMencoes(
                chatId,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐎𝐈 𝐀𝐔𝐓𝐎*
│
├➤ 🟢 _𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐚𝐭𝐢𝐯𝐚𝐝𝐨!_
│
├➤ 𝐐𝐮𝐚𝐧𝐝𝐨 @553298631752 𝐦𝐚𝐧𝐝𝐚𝐫 "𝐨𝐢", "𝐨𝐥𝐚" 𝐨𝐮 "𝐨𝐥á",
│   𝐨 𝐛𝐨𝐭 𝐫𝐞𝐬𝐩𝐨𝐧𝐝𝐞𝐫á:
│
├➤ *Ola Incrivel Bea!*
│
┗═•❃༺✿༻❃•═┓`,
                {
                    quotedMessageId: message.id._serialized,
                    mentions: [numeroOiAuto]
                }
            );
        }

    } catch (erro) {

        console.error(
            '❌ Erro no comando OI AUTO:',
            erro
        );

        await reagir(message, '❌');
    }
}

// ============================================================
// 🎙️ TTS E MODIFICADORES DE VOZ
// ============================================================

const EFEITOS_VOZ = {
    esquilo: { nome: '🐿️ Esquilo', filtro: 'asetrate=44100*1.55,aresample=44100,atempo=0.645' },
    chipmunk: { nome: '🐿️ Chipmunk', filtro: 'asetrate=44100*1.8,aresample=44100,atempo=0.556' },
    agudo: { nome: '🔊 Agudo', filtro: 'asetrate=44100*1.35,aresample=44100,atempo=0.741' },
    demonio: { nome: '👹 Demônio', filtro: 'asetrate=44100*0.62,aresample=44100,atempo=1.613,acompressor=threshold=-18dB:ratio=3:attack=5:release=80' },
    grave: { nome: '🗿 Grave', filtro: 'asetrate=44100*0.72,aresample=44100,atempo=1.389' },
    robo: { nome: '🤖 Robô', filtro: 'highpass=f=180,lowpass=f=5200,aecho=0.8:0.7:35:0.3,aphaser=in_gain=0.5:out_gain=0.7:delay=2:decay=0.4:speed=0.6' },
    radio: { nome: '📻 Rádio', filtro: 'highpass=f=350,lowpass=f=3000,acompressor=threshold=-18dB:ratio=4:attack=5:release=80' },
    telefone: { nome: '☎️ Telefone', filtro: 'highpass=f=500,lowpass=f=2500,acompressor=threshold=-20dB:ratio=5:attack=3:release=60' },
    megafone: { nome: '📢 Megafone', filtro: 'highpass=f=250,lowpass=f=4200,acompressor=threshold=-16dB:ratio=6:attack=2:release=50,aecho=0.8:0.6:25:0.2' },
    eco: { nome: '🏔️ Eco', filtro: 'aecho=0.8:0.88:650:0.45' },
    cavern: { nome: '🕳️ Caverna', filtro: 'aecho=0.8:0.9:900:0.5,aecho=0.8:0.7:1800:0.3' },
    alien: { nome: '👽 Alienígena', filtro: 'asetrate=44100*1.25,aresample=44100,atempo=0.8,aphaser=in_gain=0.5:out_gain=0.7:delay=3:decay=0.5:speed=0.8' },
    distorcido: { nome: '💥 Distorcido', filtro: 'acrusher=bits=8:mix=0.75,acompressor=threshold=-12dB:ratio=5:attack=2:release=40' },
    reverso: { nome: '🔄 Reverso', filtro: 'areverse' }
};

function obterEfeitoDeVoz(comando) {
    return EFEITOS_VOZ[String(comando || '').toLowerCase()] || null;
}

async function executarFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const processo = spawn(ffmpeg, args);
        let erro = '';
        processo.stderr.on('data', parte => { erro += parte.toString(); });
        processo.on('error', reject);
        processo.on('close', codigo => {
            if (codigo !== 0) return reject(new Error(`FFmpeg terminou com código ${codigo}: ${erro.trim()}`));
            resolve();
        });
    });
}

// Cache local dos áudios que o próprio bot enviou.
// Isso permite encadear efeitos sem depender do download da mídia pelo
// WhatsApp Web, que pode falhar em mensagens enviadas pelo próprio bot.
const CACHE_AUDIO_BOT = new Map();
const CACHE_AUDIO_BOT_LIMITE = 30;

function chaveMensagemAudio(mensagem) {
    if (!mensagem) return null;
    const id = mensagem.id || mensagem._data?.id || mensagem.rawData?.id;
    if (!id) return null;
    if (typeof id === 'string') return id;
    return id.$1 || id._serialized || (id.fromMe !== undefined && id.remote && id.id
        ? `${id.fromMe}_${id.remote}_${id.id}`
        : null);
}

function guardarAudioBot(mensagem, audio) {
    const chave = chaveMensagemAudio(mensagem);
    if (!chave || !audio?.data) return;

    CACHE_AUDIO_BOT.set(chave, {
        data: audio.data,
        mimetype: audio.mimetype || 'audio/ogg; codecs=opus',
        filename: audio.filename,
        filesize: audio.filesize,
        criadoEm: Date.now(),
    });

    while (CACHE_AUDIO_BOT.size > CACHE_AUDIO_BOT_LIMITE) {
        const primeira = CACHE_AUDIO_BOT.keys().next().value;
        if (primeira === undefined) break;
        CACHE_AUDIO_BOT.delete(primeira);
    }
}

function recuperarAudioBot(mensagem) {
    const chave = chaveMensagemAudio(mensagem);
    if (!chave) return null;
    const salvo = CACHE_AUDIO_BOT.get(chave);
    if (!salvo) return null;
    return new MessageMedia(salvo.mimetype, salvo.data, salvo.filename, salvo.filesize);
}

async function obterMensagemDeAudio(message) {
    if (message.hasMedia) return message;

    if (message.hasQuotedMsg) {
        // Primeiro tenta o cache. É o caminho mais confiável para áudios que
        // foram gerados pelo próprio bot e depois receberam outro efeito.
        try {
            const citada = await message.getQuotedMessage();
            if (citada) {
                const audioCache = recuperarAudioBot(citada);
                if (audioCache) return audioCache;
                if (citada.hasMedia) return citada;
            }
        } catch (_) {}

        // Algumas versões recentes do WhatsApp Web expõem a mensagem citada
        // apenas dentro de _data/rawData. Tentamos o ID diretamente para o
        // cache antes de recorrer ao download normal.
        const quotedRaw = message.rawData?.quotedMsg || message._data?.quotedMsg;
        if (quotedRaw) {
            const audioCache = recuperarAudioBot(quotedRaw);
            if (audioCache) return audioCache;
        }
    }

    return null;
}

function extensaoAudio(mimetype) {
    const tipo = String(mimetype || '').toLowerCase();
    if (tipo.includes('ogg')) return '.ogg';
    if (tipo.includes('mpeg') || tipo.includes('mp3')) return '.mp3';
    if (tipo.includes('mp4') || tipo.includes('m4a')) return '.m4a';
    if (tipo.includes('wav')) return '.wav';
    return '.bin';
}

function formatarErroDownload(erro) {
    if (!erro) return 'erro desconhecido';
    if (typeof erro === 'string') return erro;
    if (erro instanceof Error && erro.message) return erro.message;
    if (erro?.message) return String(erro.message);
    try {
        return JSON.stringify(erro);
    } catch (_) {
        return String(erro);
    }
}

async function baixarMidiaWhatsAppCompativel(mensagem) {
    const raw = mensagem?.rawData || mensagem?._data || {};

    // O WhatsApp Web atual está migrando os IDs de _serialized para $1.
    // Para mídia, tentamos primeiro usar os dados criptográficos que já vieram
    // no próprio objeto Message, sem depender da busca Msg.get().
    const mediaRaw = raw.mediaData || raw.media || {};
    const dadosDiretos = {
        directPath: raw.directPath || mediaRaw.directPath || mensagem?.directPath,
        encFilehash: raw.encFilehash || mediaRaw.encFilehash || mensagem?.encFilehash,
        filehash: raw.filehash || mediaRaw.filehash || mensagem?.filehash,
        mediaKey: raw.mediaKey || mediaRaw.mediaKey || mensagem?.mediaKey,
        mediaKeyTimestamp: raw.mediaKeyTimestamp || mediaRaw.mediaKeyTimestamp || mensagem?.mediaKeyTimestamp,
        type: raw.type || mediaRaw.type || mensagem?.type,
        mimetype: raw.mimetype || mediaRaw.mimetype || mensagem?.mimetype,
        filename: raw.filename || mediaRaw.filename || mensagem?.filename,
        filesize: raw.size || mediaRaw.size || mensagem?.filesize || mensagem?.size,
    };

    let ultimoErro = null;

    if (
        dadosDiretos.directPath &&
        dadosDiretos.mediaKey &&
        dadosDiretos.filehash &&
        dadosDiretos.encFilehash
    ) {
        try {
            const resultadoDireto = await client.pupPage.evaluate(async (dados) => {
                const mockQpl = {
                    addAnnotations() { return this; },
                    addPoint() { return this; },
                };

                const decryptedMedia = await window
                    .require('WAWebDownloadManager')
                    .downloadManager
                    .downloadAndMaybeDecrypt({
                        directPath: dados.directPath,
                        encFilehash: dados.encFilehash,
                        filehash: dados.filehash,
                        mediaKey: dados.mediaKey,
                        mediaKeyTimestamp: dados.mediaKeyTimestamp,
                        type: dados.type,
                        signal: new AbortController().signal,
                        downloadQpl: mockQpl,
                    });

                const data = await window.WWebJS.arrayBufferToBase64Async(decryptedMedia);

                return {
                    data,
                    mimetype: dados.mimetype,
                    filename: dados.filename,
                    filesize: dados.filesize,
                };
            }, dadosDiretos);

            if (resultadoDireto?.data) {
                return new MessageMedia(
                    resultadoDireto.mimetype || 'audio/ogg',
                    resultadoDireto.data,
                    resultadoDireto.filename,
                    resultadoDireto.filesize,
                );
            }
        } catch (erroDireto) {
            ultimoErro = erroDireto;
        }
    } else {
        ultimoErro = new Error('Dados criptográficos da mídia incompletos no objeto Message.');
    }

    const id = mensagem?.id || {};
    const candidatos = [];

    // $1 é o novo nome usado por algumas versões recentes do WhatsApp Web.
    if (id.$1) candidatos.push(id.$1);
    if (id._serialized && !candidatos.includes(id._serialized)) {
        candidatos.push(id._serialized);
    }
    if (id.fromMe !== undefined && id.remote && id.id) {
        const reconstruido = `${id.fromMe}_${id.remote}_${id.id}`;
        if (!candidatos.includes(reconstruido)) candidatos.push(reconstruido);
    }

    if (client.pupPage && candidatos.length) {
        try {
            const resultado = await client.pupPage.evaluate(async (ids) => {
                const collections = window.require('WAWebCollections');
                const downloadManager = window.require('WAWebDownloadManager').downloadManager;
                const mockQpl = {
                    addAnnotations() { return this; },
                    addPoint() { return this; },
                };

                for (const id of ids) {
                    try {
                        let msg = collections.Msg.get(id);
                        if (!msg) {
                            msg = (await collections.Msg.getMessagesById([id]))?.messages?.[0];
                        }
                        if (!msg || !msg.mediaData || msg.mediaData.mediaStage === 'REUPLOADING') {
                            continue;
                        }

                        if (msg.mediaData.mediaStage !== 'RESOLVED') {
                            await msg.downloadMedia({
                                downloadEvenIfExpensive: true,
                                rmrReason: 1,
                            });
                        }

                        if (
                            !msg.mediaData ||
                            String(msg.mediaData.mediaStage || '').includes('ERROR') ||
                            msg.mediaData.mediaStage === 'FETCHING'
                        ) {
                            continue;
                        }

                        const decryptedMedia = await downloadManager.downloadAndMaybeDecrypt({
                            directPath: msg.directPath,
                            encFilehash: msg.encFilehash,
                            filehash: msg.filehash,
                            mediaKey: msg.mediaKey,
                            mediaKeyTimestamp: msg.mediaKeyTimestamp,
                            type: msg.type,
                            signal: new AbortController().signal,
                            downloadQpl: mockQpl,
                        });

                        const data = await window.WWebJS.arrayBufferToBase64Async(decryptedMedia);
                        return {
                            data,
                            mimetype: msg.mimetype,
                            filename: msg.filename,
                            filesize: msg.size,
                        };
                    } catch (erro) {
                        // Um formato de ID pode falhar enquanto outro ainda funciona.
                    }
                }

                return null;
            }, candidatos);

            if (resultado?.data) {
                return new MessageMedia(
                    resultado.mimetype || dadosDiretos.mimetype || 'audio/ogg',
                    resultado.data,
                    resultado.filename || dadosDiretos.filename,
                    resultado.filesize || dadosDiretos.filesize,
                );
            }
        } catch (erroFallback) {
            ultimoErro = erroFallback;
        }
    }

    // Último recurso: usa a implementação oficial da biblioteca. Não fazemos
    // reload() aqui porque Message.reload() ainda depende de id._serialized em
    // whatsapp-web.js 1.34.7 e pode substituir o erro real por outro t: t.
    // Alguns áudios citados pelo bot chegam como objetos simples, sem o
    // método downloadMedia(). Nesse caso não devemos chamar esse método.
    if (typeof mensagem?.downloadMedia === 'function') {
        try {
            const midia = await mensagem.downloadMedia();
            if (midia) return midia;
        } catch (erroOficial) {
            ultimoErro = erroOficial;
        }
    } else if (!ultimoErro) {
        ultimoErro = new Error('Objeto de mídia citado não possui downloadMedia().');
    }

    throw new Error(`Download de mídia falhou: ${formatarErroDownload(ultimoErro)}`);
}

async function modificarAudio(message, comando) {
    const efeito = obterEfeitoDeVoz(comando);
    if (!efeito) return false;

    try {
        const mensagemAudio = await obterMensagemDeAudio(message);
        if (!mensagemAudio) {
            await reagir(message, '🎙️');
            await responderCitando(message, `┏═•❃༺🎙️༻❃•═┓\n│       *𝐄𝐅𝐄𝐈𝐓𝐎 𝐃𝐄 𝐕𝐎𝐙*\n├✯\n│\n├➤ 🎙️ _Envie um áudio junto com_ *${PREFIXO}${comando}*\n│   _ou responda a um áudio com o comando._\n│\n┗═•❃༺🎙️༻❃•═┓`);
            return true;
        }

        let midia = null;
        let ultimoErroDownload = null;

        for (let tentativa = 1; tentativa <= 3; tentativa++) {
            try {
                // Não usamos mensagemAudio.reload() nas tentativas seguintes.
                // A implementação atual de whatsapp-web.js ainda usa id._serialized
                // internamente e pode falhar antes mesmo de tentar baixar a mídia.
                midia = await baixarMidiaWhatsAppCompativel(mensagemAudio);
                if (midia) break;
            } catch (erroDownload) {
                ultimoErroDownload = erroDownload;
                if (tentativa < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!midia) {
            throw new Error(`Não foi possível baixar o áudio do WhatsApp após 3 tentativas: ${ultimoErroDownload?.message || 'mídia indisponível'}`);
        }
        if (!midia || !String(midia.mimetype || '').toLowerCase().startsWith('audio/')) {
            await reagir(message, '❌');
            await responderCitando(message, '❌ _A mídia selecionada não é um áudio válido._');
            return true;
        }

        const pasta = path.join(os.tmpdir(), 'justbot-voz');
        await fs.promises.mkdir(pasta, { recursive: true });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const entrada = path.join(pasta, `${id}-input${extensaoAudio(midia.mimetype)}`);
        const saida = path.join(pasta, `${id}-output.ogg`);

        try {
            await fs.promises.writeFile(entrada, Buffer.from(midia.data, 'base64'));
            await executarFFmpeg([
                '-hide_banner', '-loglevel', 'error', '-y', '-i', entrada,
                '-t', '60', '-af', efeito.filtro, '-vn',
                '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on', '-application', 'voip', saida
            ]);
            const dados = await fs.promises.readFile(saida);
            const audio = new MessageMedia('audio/ogg; codecs=opus', dados.toString('base64'), `${comando}.ogg`);
            await reagir(message, '🎙️');
            await responderCitando(message, `┏═•❃༺🎙️༻❃•═┓\n│       *𝐄𝐅𝐄𝐈𝐓𝐎 𝐃𝐄 𝐕𝐎𝐙*\n├✯\n│\n├➤ ${efeito.nome}\n│   _Áudio processado com sucesso!_\n│\n┗═•❃༺🎙️༻❃•═┓`);
            const mensagemEnviada = await client.sendMessage(message.from, audio, { sendAudioAsVoice: true });
            guardarAudioBot(mensagemEnviada, audio);
        } finally {
            await Promise.allSettled([fs.promises.unlink(entrada), fs.promises.unlink(saida)]);
        }
    } catch (erro) {
        console.error(`❌ Erro no efeito de voz ${comando}:`, erro);
        await reagir(message, '❌');
        await responderCitando(message, `┏═•❃༺❌༻❃•═┓\n│       *𝐄𝐅𝐄𝐈𝐓𝐎 𝐃𝐄 𝐕𝐎𝐙*\n├✯\n│\n├➤ ❌ _Não consegui aplicar_ *${efeito.nome}*\n│   _Verifique se o áudio é válido e tente novamente._\n│\n┗═•❃༺❌༻❃•═┓`);
    }
    return true;
}

async function comandoTTS(message, argumentos) {
    const texto = String(argumentos || '').trim();
    if (!texto) {
        await reagir(message, '🗣️');
        await responderCitando(message, `┏═•❃༺🗣️༻❃•═┓\n│       *𝐓𝐄𝐗𝐓𝐎 𝐏𝐀𝐑𝐀 𝐕𝐎𝐙*\n├✯\n│\n├➤ 🗣️ _Informe o texto que devo falar._\n│\n├➤ Exemplo: *${PREFIXO}tts Olá pessoal, tudo bem?*\n│\n┗═•❃༺🗣️༻❃•═┓`);
        return;
    }
    if (texto.length > 200) {
        await reagir(message, '⚠️');
        await responderCitando(message, `┏═•❃༺⚠️༻❃•═┓\n│       *𝐓𝐄𝐗𝐓𝐎 𝐏𝐀𝐑𝐀 𝐕𝐎𝐙*\n├✯\n│\n├➤ ⚠️ _O texto para TTS deve ter no máximo 200 caracteres._\n│\n┗═•❃༺⚠️༻❃•═┓`);
        return;
    }

    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt-BR&q=${encodeURIComponent(texto)}`;
        const resposta = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!resposta.ok) throw new Error(`Google TTS respondeu HTTP ${resposta.status}`);
        const dados = Buffer.from(await resposta.arrayBuffer());
        if (!dados.length) throw new Error('Google TTS não retornou áudio.');

        // O Google TTS retorna MP3, mas o WhatsApp funciona de forma muito
        // mais confiável com mensagem de voz em OGG/Opus. Enviar o MP3
        // diretamente com sendAudioAsVoice pode resultar em "não foi possível
        // baixar o áudio" no aplicativo.
        const pasta = path.join(os.tmpdir(), 'justbot-voz');
        await fs.promises.mkdir(pasta, { recursive: true });
        const id = `tts-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const entrada = path.join(pasta, `${id}.mp3`);
        const saida = path.join(pasta, `${id}.ogg`);

        try {
            await fs.promises.writeFile(entrada, dados);
            await executarFFmpeg([
                '-hide_banner', '-loglevel', 'error', '-y', '-i', entrada,
                '-vn', '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on',
                '-application', 'voip', '-ar', '48000', '-ac', '1', saida
            ]);

            const dadosOpus = await fs.promises.readFile(saida);
            if (!dadosOpus.length) throw new Error('FFmpeg não gerou o áudio OGG.');

            const audio = new MessageMedia(
                'audio/ogg; codecs=opus',
                dadosOpus.toString('base64'),
                'tts.ogg'
            );

            await reagir(message, '🗣️');
            await responderCitando(message, `┏═•❃༺🗣️༻❃•═┓\n│       *𝐓𝐄𝐗𝐓𝐎 𝐏𝐀𝐑𝐀 𝐕𝐎𝐙*\n├✯\n│\n├➤ 🗣️ _Voz gerada com sucesso!_\n│   _Seu áudio está logo abaixo._\n│\n┗═•❃༺🗣️༻❃•═┓`);
            const mensagemEnviada = await client.sendMessage(message.from, audio, { sendAudioAsVoice: true });
            guardarAudioBot(mensagemEnviada, audio);
        } finally {
            await Promise.allSettled([
                fs.promises.unlink(entrada),
                fs.promises.unlink(saida)
            ]);
        }
    } catch (erro) {
        console.error('❌ Erro no Google TTS:', erro.message);
        await reagir(message, '❌');
        await responderCitando(message, '❌ _Não consegui gerar a voz agora. Tente novamente em alguns segundos._');
    }
}

// ============================================================
// PROCESSADOR DE COMANDOS
// ============================================================

async function processarComando(
    message,
    comando,
    argumentos
) {

    // 🔒 MODO SOMENTE ADM
    // O próprio ;soadm fica liberado para que um administrador
    // possa alternar o modo. Todos os demais comandos passam
    // pela verificação global quando o modo está ativo.
    if (
        message?.from?.endsWith('@g.us') &&
        soAdmGrupos.has(message.from) &&
        comando !== 'soadm'
    ) {
        const admin = await usuarioEhAdminDoGrupo(message);

        if (!admin) {
            await reagir(message, '🔒');
            await responderCitando(
                message,
                '🔒 _Este grupo está no modo somente ADM. Apenas administradores podem usar os comandos._'
            );
            return;
        }
    }

    switch (comando) {

        // ============================================================
// MENUS
// ============================================================

case 'soadm':
    await soAdm(message);
    break;

case 'menu':
    await menuPrincipal(message);
    break;

case 'relacionamentos':
case 'menurelacionamentos':
    await menuRelacionamentos(message);
    break;

case 'diversao':
case 'menudiversao':
    await menuDiversao(message);
    break;

case 'jogos':
case 'menujogos':
    await menuJogos(message);
    break;

case 'rpg':
case 'menurpg':
    await menuRPG(message);
    break;

case 'midia':
case 'menumidia':
    await menuMidia(message);
    break;

case 'moderacao':
case 'menuadmin':
case 'menumoderacao':
    await menuModeracao(message);
    break;

case 'apis':
case 'api':
case 'menuapis':
    await menuAPIs(message);
    break;

case 'utilidades':
case 'menuutil':
    await menuUtil(message);
    break;

case 'bot':
case 'menubot':
    await menuBot(message);
    break;

case 'personalidade':
case 'persona':
    await definirPersonalidade(message, argumentos);
    break;

case 'personalidades':
case 'personas':
    await listarPersonalidades(message);
    break;

case 'conquistas':
case 'conquista':
case 'achievements':
    await mostrarConquistas(message);
    break;

case 'comandos':
    await listarComandos(message);
    break;

case 'changelog':
case 'changelogs':
    await changelog(message);
    break;

case 'sobre':
    await sobre(message);
    break;


        // ============================================================
        // JOGOS
        // ============================================================

        case 'dado':
            await jogarDado(message);
            break;

        case 'moeda':
            await jogarMoeda(message);
            break;

        case 'sn':
            await jogarSN(
                message,
                argumentos
            );
            break;

        case 'ppt':
            await jogarPPT(
                message,
                argumentos
            );
            break;

        case 'adivinha':
            await iniciarAdivinhacao(message);
            break;

        case 'chute':
            if (
                (message.mentionedIds && message.mentionedIds.length > 0) ||
                message.hasQuotedMsg
            ) {
                await chuteRPG(message);
            } else {
                await fazerChute(message, argumentos);
            }
            break;

        case 'chuterpg':
            await chuteRPG(message);
            break;

        case 'quiz':

            if (
                argumentos.trim()
            ) {

                await responderQuiz(
                    message,
                    argumentos
                );

            } else {

                await iniciarQuiz(message);
            }

            break;

        case 'pokemon':
        case 'poke':
            await comandoPokemon(message, argumentos);
            break;

        case 'piada':
        case 'joke':
            await comandoPiadaAPI(message);
            break;

        case 'anime':
            await comandoAnime(message, argumentos);
            break;

        case 'clima':
        case 'tempo':
            await comandoClima(message, argumentos);
            break;

        case 'qr':
        case 'qrcode':
            await comandoQR(message, argumentos);
            break;

        case 'shazam':
        case 'identificarmusica':
            await comandoShazam(message);
            break;

        case 'futebol':
        case 'fut':
            await comandoFutebol(message, argumentos);
            break;

        case 'f1':
        case 'formula1':
        case 'formulauno':
            await comandoF1(message, argumentos);
            break;

        case 'ar':
        case 'qualidadedoar':
            await comandoQualidadeAr(message, argumentos);
            break;

        case 'ppp':
    await jogoPPP(message);
    break;

        case 'minerar':
        case 'mina':
            await minerar(message);
            break;

        case 'loja':
        case 'shop':
            await mostrarLoja(message);
            break;

        case 'comprar':
        case 'buy':
            await comprarItem(message, argumentos);
            break;

        case 'inventario':
        case 'inv':
            await mostrarInventario(message);
            break;

        case 'doar':
        case 'donate':
            await doarMoedas(message, argumentos);
            break;

        case 'sortearm':
            await sortearMoedas(message, argumentos);
            break;

        case 'rankingdinheiro':
        case 'rankingmoedas':
        case 'ricos':
            await rankingDinheiro(message);
            break;

        case 'slots':
        case 'slot':
            await jogarSlots(
                message,
                argumentos
            );
            break;

        case 'saldo':
        case 'carteira':
            await mostrarSaldo(message);
            break;

        case 'batata':
        case 'batataquente':
        case 'hotpotato':
            await jogarBatataQuente(message);
            break;

        case 'rr':
        case 'roletarussa':
        case 'roleta':
            await jogarRoletaRussa(message);
            break;


        // ============================================================
        // RPG
        // ============================================================

        case 'tapa':
            await tapa(message);
            break;

        case 'soco':
            await soco(message);
            break;

        case 'empurrar':
            await empurrar(message);
            break;

        case 'abracar':
        case 'abraçar':
            await abracar(message);
            break;

        case 'proteger':
            await proteger(message);
            break;

        case 'curar':
            await curar(message);
            break;

        case 'elogiar':
            await elogiar(message);
            break;

        case 'zoar':
            await zoar(message);
            break;

        case 'duelo':
            await duelo(message);
            break;

        case 'roubar':
            await roubar(message);
            break;

        case 'aventura':
            await aventura(message);
            break;

        case 'suicidio':
    await suicidio(message);
    break;

case 'piadas':
    await mandarPiada(message);
    break;

case 'addpiada':
    await adicionarPiada(
        message,
        argumentos
    );
    break;

case 'listapiadas':
    await listarPiadas(message);
    break;

case 'removerpiada':
    await removerPiada(
        message,
        argumentos
    );
    break;

case 'limparpiadas':
    await limparPiadas(message);
    break;

case 'carregarpiadas':
    await carregarPiadas(message);
    break;

case 'cantada':
    await mandarCantada(message);
    break;


        // ============================================================
        // ADMIN
        // ============================================================

        case 'aviso':
    await adicionarAviso(message, argumentos);
    break;

case 'rem_aviso':
    await removerAviso(message, argumentos);
    break;

case 'listaviso':
    await listarAvisos(message);
    break;
        
        case 'casar':
            await casarPessoa(message);
            break;

        case 'divorcio':
            await divorcioPessoa(message);
            break;
        
        case 'adotar':
            await adotarPessoa(message);
            break;

        case 'familia':
            await mostrarFamilia(message);
            break;

        case 'casal':
            await formarCasalAleatorio(message);
            break;

        case 'shipar':
           await shiparPessoas(message);
           break;
        
            case 'aceitar':
    // 💔 Primeiro verifica se existe um divórcio aguardando confirmação
    if (await aceitarDivorcio(message)) {
        break;
    }

    // 💍 Caso contrário, trata como proposta de casamento
    await aceitarCasamento(message);
    break;

case 'recusar':
    // 💔 Primeiro verifica se existe um divórcio aguardando confirmação
    if (await recusarDivorcio(message)) {
        break;
    }

    // 💍 Caso contrário, trata como proposta de casamento
    await recusarCasamento(message);
    break;
        
    case 'ttg':
    await ttg(
        message,
        argumentos
    );
    break;    
    
    case 'ban':
        case 'banir':
            await banirPessoa(message);
            break;

        case 'mute':
            await mutarPessoa(message);
            break;

        case 'unmute':
            await desmutarPessoa(message);
            break;

        case 'muteblacklist':
            await adicionarBlacklist(
                message,
                argumentos
            );
            break;

        case 'unmuteblacklist':
            await removerBlacklist(
                message,
                argumentos
            );
            break;

        case 'oiauto':
    await comandoOiAuto(message);
    break;


        // ============================================================
        // UTILIDADES
        // ============================================================

        case 'ping':
            await ping(message);
            break;

        case 'hora':
            await mostrarHora(message);
            break;

        case 'info':
            await mostrarInfo(message);
            break;

        case 'afk':
    await ativarAFK(
        message,
        argumentos
    );
    break;

    case 'perfil':
    await mostrarPerfil(message, argumentos);
    break;

    case 'ranking':
    await mostrarRanking(message);
    break;

case 'rankingfilhos':
case 'rankingfilho':
case 'filhosranking':
    await mostrarRankingFilhos(message);
    break;


        // ============================================================
        // MÍDIA
        // ============================================================

        case 'fig':
        case 'figurinha':
            await criarFigurinha(message);
            break;

        case 'emojimix':
            await combinarEmojis(
                message,
                argumentos
            );
            break;

        case 'brat1':
            await gerarBrat1(
                message,
                argumentos
            );
            break;

        case 'brat2':
            await gerarBrat2(
                message,
                argumentos
            );
            break;

        case 'tts':
            await comandoTTS(message, argumentos);
            break;

        case 'esquilo':
        case 'chipmunk':
        case 'agudo':
        case 'demonio':
        case 'grave':
        case 'robo':
        case 'radio':
        case 'telefone':
        case 'megafone':
        case 'eco':
        case 'cavern':
        case 'alien':
        case 'distorcido':
        case 'reverso':
            await modificarAudio(message, comando);
            break;

        case 'playm':
            await tocarMusica(
                message,
                argumentos
            );
            break;

        case 'playv':
    await tocarVideo(
        message,
        argumentos
    );
    break;


        // ============================================================
        // COMANDO DESCONHECIDO
        // ============================================================

        default:

            await reagir(
                message,
                '❌'
            );

            await responderCitando(
                message,
                `┏═•❃༺✿༻❃•═┓
├✯ *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎*
│
├➤ _O comando_
│   *${PREFIXO}${comando}*
│   _não existe._
│
├➤ *𝐃𝐈𝐆𝐈𝐓𝐄:*
│   📋 *${PREFIXO}menu*
│
├➤ _Ou veja todos os comandos:_
│   📜 *${PREFIXO}comandos*
│
┗═•❃༺✿༻❃•═┛`
            );

            break;
    }
}

// ============================================================
// RECEBIMENTO DE MENSAGENS
// ============================================================

client.on(
    'message',
    async message => {

        try {

            // Ignorar mensagens do próprio bot
            if (message.fromMe) {
                return;
            }

// ============================================================
// APAGAR MENSAGENS DE QUEM ESTÁ MUTADO
// ============================================================

const idRemetente =
    obterIdRemetente(message);


// Verificar se o remetente está na blacklist
let naBlacklist = false;

if (idRemetente) {

    // Verificação direta
    if (blacklistMute.has(idRemetente)) {
        naBlacklist = true;
    }

    // Verificação pelo número, para funcionar
    // mesmo quando o WhatsApp usar LID
    if (!naBlacklist) {

        const numeroRemetente =
            String(idRemetente)
                .split('@')[0];

        for (const idBlacklist of blacklistMute) {

            const numeroBlacklist =
                String(idBlacklist)
                    .split('@')[0];

            if (
                numeroRemetente ===
                numeroBlacklist
            ) {
                naBlacklist = true;
                break;
            }
        }
    }
}

// ============================================================
// 👥 REGISTRAR PARTICIPANTE DO GRUPO
// ============================================================

if (
    message.from.endsWith('@g.us') &&
    idRemetente
) {

    if (
        !participantesGrupos.has(
            message.from
        )
    ) {

        participantesGrupos.set(
            message.from,
            new Set()
        );
    }

    const participantes =
        participantesGrupos.get(
            message.from
        );

    const tamanhoAntes =
        participantes.size;

    participantes.add(
        idRemetente
    );

    // Só salva quando uma pessoa nova é adicionada
    if (
        participantes.size >
        tamanhoAntes
    ) {

        salvarParticipantesGrupos();
    }
}

const listaMutadosGrupo =
    mutados.get(message.from);

let mutadoNoGrupo = false;

if (
    listaMutadosGrupo &&
    idRemetente
) {

    if (
        listaMutadosGrupo.has(
            idRemetente
        )
    ) {

        mutadoNoGrupo = true;
    }

    if (!mutadoNoGrupo) {

        const numeroRemetente =
            String(idRemetente)
                .split('@')[0];

        for (
            const idMutado
            of listaMutadosGrupo
        ) {

            const numeroMutado =
                String(idMutado)
                    .split('@')[0];

            if (
                numeroRemetente ===
                numeroMutado
            ) {

                mutadoNoGrupo = true;
                break;
            }
        }
    }
}

// ============================================================
// ✨ XP POR MENSAGEM
// ============================================================

if (
    message.from.endsWith('@g.us') &&
    idRemetente
) {

    const resultadoXP =
        adicionarXP(
            message.from,
            idRemetente
        );

    atualizarControleXPOnline(
        message
    );

    if (resultadoXP) {

        salvarXP();

        // ====================================================
        // 🎖️ VERIFICAR CONQUISTAS
        // ====================================================

        const novasConquistas =
            verificarConquistas(
                idRemetente,
                resultadoXP
            );

        // ====================================================
        // 🎖️ AVISAR SOBRE NOVAS CONQUISTAS
        // ====================================================

        if (
            novasConquistas.length > 0
        ) {

            for (
                const conquistaId
                of novasConquistas
            ) {

                const conquista =
                    CONQUISTAS[
                        conquistaId
                    ];

                if (!conquista) {
                    continue;
                }

                try {

                    const mencaoUsuario =
                        `@${String(
                            idRemetente
                        ).split('@')[0]}`;

                    await enviarComMencoes(
                        message.from,

                        `┏═•❃༺🎖️༻❃•═┓
│
│  *𝐍𝐎𝐕𝐀 𝐂𝐎𝐍𝐐𝐔𝐈𝐒𝐓𝐀!*
│
├➤ 👤 ${mencaoUsuario}
│
├➤ ${conquista.emoji} *${conquista.nome}*
│
├➤ _${conquista.descricao}_
│
┗═•❃༺🎖️༻❃•═┓
✨ _Continue participando para desbloquear mais conquistas!_`,

                        {
                            mentions: [
                                idRemetente
                            ]
                        }
                    );

                } catch (erro) {

                    console.error(
                        '⚠️ Erro ao enviar mensagem de conquista:',
                        erro
                    );

                }
            }
        }

        // ====================================================
        // ⭐ AVISO DE SUBIDA DE NÍVEL
        // ====================================================

        if (
            resultadoXP.subiuNivel
        ) {

            try {

                const mencaoUsuario =
                    `@${String(
                        idRemetente
                    ).split('@')[0]}`;

                await enviarComMencoes(
                    message.from,
                    `┏═•❃༺⭐༻❃•═┓
│   *🎉 𝐍𝐈́𝐕𝐄𝐋 𝐀𝐔𝐌𝐄𝐍𝐓𝐎𝐔!*
├✯
├➤ 👤 ${mencaoUsuario}
│   _está ficando cada vez mais forte!_
│
├➤ ⭐ *𝐍𝐎𝐕𝐎 𝐍𝐈́𝐕𝐄𝐋*
│   ➜ *Nível ${resultadoXP.nivel}*
│
├➤ ✨ *𝐗𝐏 𝐀𝐓𝐔𝐀𝐋*
│   ➜ *${resultadoXP.xp} XP*
│
┗═•❃༺⭐༻❃•═┛

🎊 _Continue participando para alcançar o próximo nível!_`,

                    {
                        mentions: [
                            idRemetente
                        ]
                    }
                );

            } catch (erro) {

                console.error(
                    '⚠️ Erro ao enviar mensagem de nível:',
                    erro
                );

            }
        }
    }
}

// ========================================================
// OI AUTO
// ========================================================

if (oiAutoAtivo.get(message.from) === true) {

    try {

        const resultadoLid =
            await client.getContactLidAndPhone([
                numeroOiAuto
            ]);

        const contatoBea =
            resultadoLid?.[0];

        const lidBea =
            contatoBea?.lid?._serialized ||
            contatoBea?.lid ||
            contatoBea?.lidNumber ||
            null;

        const autorMensagem =
            message.author ||
            message.from;

        const autorNormalizado =
            String(autorMensagem || '');

        const beaLidNormalizado =
            String(lidBea || '');

        // Verifica se a mensagem veio da Bea
        if (
            beaLidNormalizado &&
            autorNormalizado ===
                beaLidNormalizado
        ) {

            const texto =
                String(message.body || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(
                        /[\u0300-\u036f]/g,
                        ''
                    );

            // Procura "oi" ou "ola"
            // como palavras inteiras
            const contemOi =
                /\boi\b/.test(texto);

            const contemOla =
                /\bola\b/.test(texto);

            if (
                contemOi ||
                contemOla
            ) {

                await message.reply(
                    'Ola Incrivel Bea!'
                );

                // Para aqui somente porque
                // o OI AUTO já respondeu
                return;
            }
        }

    } catch (erro) {

        console.error(
            '❌ Erro no OI AUTO:',
            erro
        );
    }
}


// MODERAÇÃO
if (
    mutadoNoGrupo ||
    naBlacklist
) {

    console.log(
        '🔇 USUÁRIO MUTADO! APAGANDO MENSAGEM...'
    );

    try {

        await message.delete(true);

        console.log(
            '🗑️ MENSAGEM APAGADA!'
        );

    } catch (erro) {

        console.log(
            '❌ ERRO AO APAGAR:',
            erro.message
        );
    }

    return;
}
            
// ============================================================
// 😂 CONFIRMAÇÃO PARA LIMPAR PIADAS
// ============================================================

const chatId =
    message.from;

const autor =
    message.author ||
    message.from;

const chave =
    `${chatId}_${autor}`;

if (
    confirmacoesLimparPiadas.has(chave)
) {

    const respostaLimpar =
        message.body
            .trim()
            .toLowerCase();

    if (
        respostaLimpar === 'sim'
    ) {

        piadas.length = 0;

        salvarPiadas();

        confirmacoesLimparPiadas.delete(
            chave
        );

        await reagir(
            message,
            '🗑️'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐏𝐈𝐀𝐃𝐀𝐒 𝐀𝐏𝐀𝐆𝐀𝐃𝐀𝐒!*
│
├➤ Todas as piadas foram
│   removidas com sucesso.
│
│  📚 Total atual:
│   *0 piadas*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }

    if (
        respostaLimpar === 'nao' ||
        respostaLimpar === 'não'
    ) {

        confirmacoesLimparPiadas.delete(
            chave
        );

        await reagir(
            message,
            '❌'
        );

        await responderCitando(
            message,
            `┏═•❃༺😂༻❃•═┓
│
│  *𝐀𝐂̧𝐀̃𝐎 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐀*
│
│  As piadas continuam
│  intactas. 😎
│
│  📚 Total:
│   *${piadas.length} piada${piadas.length === 1 ? '' : 's'}*
│
┗═•❃༺😂༻❃•═┛`
        );

        return;
    }
}

const selecaoAvisoProcessada =
    await processarSelecaoRemoverAviso(message);

if (selecaoAvisoProcessada) {
    return;
}

// ============================================================
// 👶 RESPOSTA DE PROPOSTA DE ADOÇÃO
// ============================================================

const respostaAdocao =
    message.body
        .trim()
        .toLowerCase();

if (respostaAdocao === 'sim') {

    if (
        await aceitarAdocao(message)
    ) {
        return;
    }
}

if (respostaAdocao === 'nao') {

    if (
        await recusarAdocao(message)
    ) {
        return;
    }
}

// ============================================================
// 💤 SISTEMA AFK
// ============================================================

if (
    message.from.endsWith('@g.us')
) {

    const idRemetenteAFK =
        obterIdAFK(message);


    // ========================================================
    // 👋 VERIFICAR SE O REMETENTE ESTAVA AFK
    // ========================================================

    if (
        idRemetenteAFK &&
        !message.body
            .trim()
            .toLowerCase()
            .startsWith(
                `${PREFIXO}afk`
            )
    ) {

        const chaveProprioAFK =
            obterChaveAFK(
                message,
                idRemetenteAFK
            );


        if (
            usuariosAFK.has(
                chaveProprioAFK
            )
        ) {

            const dadosAFK =
                usuariosAFK.get(
                    chaveProprioAFK
                );


            usuariosAFK.delete(
                chaveProprioAFK
            );

            salvarAFK();


            await removerAFK(
                message,
                dadosAFK
            );

        }

    }


    // ========================================================
    // 🔔 VERIFICAR MENÇÕES
    // ========================================================

    const mencionados =
        message.mentionedIds ||
        [];


    for (
        const idMencionado
        of mencionados
    ) {

        const chaveMencionado =
            obterChaveAFK(
                message,
                idMencionado
            );


        if (
            usuariosAFK.has(
                chaveMencionado
            )
        ) {

            const dadosAFK =
                usuariosAFK.get(
                    chaveMencionado
                );


            await responderCitando(
                message,
                `╭━━━〔 💤 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐀𝐅𝐊 〕━━━╮
│
│ 👤 @${String(idMencionado).split('@')[0]}
│
│ 📝 *Motivo:* _${dadosAFK.motivo}_
│ ⏱️ *Ausente há:* ${formatarTempoAFKCurto(dadosAFK.inicio)}
│
╰━━━━━━━━━━━━━━━━━━━━╯
💤 _Este usuário está temporariamente ausente._`
            , { mentions: [idMencionado] }
            );

        }

    }


    // ========================================================
    // ↩️ VERIFICAR RESPOSTA
    // ========================================================

    if (
        message.hasQuotedMsg
    ) {

        try {

            const mensagemRespondida =
                await message.getQuotedMessage();


            const idAutorResposta =
                mensagemRespondida.author ||
                mensagemRespondida.from;


            if (
                idAutorResposta
            ) {

                const chaveResposta =
                    obterChaveAFK(
                        message,
                        idAutorResposta
                    );


                if (
                    usuariosAFK.has(
                        chaveResposta
                    )
                ) {

                    const dadosAFK =
                        usuariosAFK.get(
                            chaveResposta
                        );


                    await responderCitando(
                        message,
                        `╭━━━〔 💤 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐀𝐅𝐊 〕━━━╮
│
│ 👤 @${String(idAutorResposta).split('@')[0]}
│
│ 📝 *Motivo:* _${dadosAFK.motivo}_
│ ⏱️ *Ausente há:* ${formatarTempoAFKCurto(dadosAFK.inicio)}
│
╰━━━━━━━━━━━━━━━━━━━━╯
💤 _Este usuário está temporariamente ausente._`
                    , { mentions: [idAutorResposta] }
                    );

                }

            }

        } catch (erro) {

            console.log(
                '⚠️ Erro ao verificar resposta AFK:',
                erro.message
            );

        }

    }

}

// Ignorar mensagens normais
            if (
                !message.body.startsWith(
                    PREFIXO
                )
            ) {
                return;
            }

            const texto =
                message.body
                    .slice(PREFIXO.length)
                    .trim();

            if (!texto) {
                await reagir(
                    message,
                    '❌'
                );

                return;
            }

            const partes =
                texto.split(/\s+/);

            const comando =
                partes
                    .shift()
                    .toLowerCase();

            const argumentos =
                partes.join(' ');

            await processarComando(
                message,
                comando,
                argumentos
            );

        } catch (erro) {

            console.error(
                '❌ ERRO NO PROCESSAMENTO:',
                erro
            );

            try {

                await reagir(
                    message,
                    '❌'
                );

                await responderCitando(
                    message,
                    '❌ _Ocorreu um erro ao executar esse comando._'
                );

            } catch (erroResposta) {

                console.error(
                    '❌ Não foi possível enviar a mensagem de erro:',
                    erroResposta
                );
            }
        }
    }
);


let ultimaVerificacaoAvisos = null;

async function verificarAvisos() {
    const { data, hora } = obterDataHoraSaoPaulo();

    const chaveExecucao = `${data}_${hora}`;

    // Evita verificar a mesma hora várias vezes
    if (ultimaVerificacaoAvisos === chaveExecucao) {
        return;
    }

    ultimaVerificacaoAvisos = chaveExecucao;

    for (const [grupoId, lista] of avisos.entries()) {
        for (const aviso of lista) {

            if (
                aviso.hora === hora &&
                aviso.ultimoEnvio !== data
            ) {
                try {
                await client.sendMessage(
    grupoId,
    `╭─〔 🔔 *𝐀𝐕𝐈𝐒𝐎* 〕
│
│ │ *${aviso.mensagem}*
│
╰────────────────`
);;

                    aviso.ultimoEnvio = data;

                    salvarAvisos();

                    console.log(
                        `🔔 Aviso enviado para ${grupoId}: ${aviso.mensagem}`
                    );

                } catch (erro) {
                    console.error(
                        `❌ Erro ao enviar aviso para ${grupoId}:`,
                        erro
                    );
                }
            }
        }
    }
}

client.on('ready', () => {
    console.log('🔔 Sistema de avisos iniciado!');

    verificarAvisos().catch(erro => {
        console.error('❌ Erro na verificação inicial dos avisos:', erro);
    });

    setInterval(() => {
        verificarAvisos().catch(erro => {
            console.error('❌ Erro na verificação dos avisos:', erro);
        });
    }, 15000);
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(
    '\nIniciando WhatsApp...\n'
);

client.initialize();