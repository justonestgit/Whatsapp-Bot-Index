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
const crypto = require('crypto');
const { criarAgenteIA } = require('./ai-agent');

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

let PREFIXO = ';';
const arquivoConfigAdmin = './dados/config-admin.json';
const configuracoesAdminGrupos = new Map();
const sorteiosGrupos = new Map();
const logsAdminGrupos = new Map();
const participantesSorteio = new Map();
const historicoFlood = new Map();
const NOME_BOT = 'JUST BOT';
const VERSAO = '3.19';
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
const jogosForca = new Map();
const jogosStop = new Map();
const personalidadesGrupos = new Map();
const configuracoesRanks = new Map();
const historicoEconomia = [];
const inventariosEconomia = new Map();
const cooldownsMineracao = new Map();
const cooldownsRoubo = new Map();
const dadosRoubo = new Map();

// ============================================================
// ðï¸ SISTEMA DE CONQUISTAS
// ============================================================

const conquistasUsuarios = new Map();

const CONQUISTAS = {
    primeiroPasso: {
        nome: 'Primeiro Passo',
        emoji: 'ð±',
        descricao: 'Ganhe XP pela primeira vez.'
    },

    tagarela: {
        nome: 'Tagarela',
        emoji: 'ð¬',
        descricao: 'Envie 100 mensagens.'
    },

    faladorProfissional: {
        nome: 'Falador Profissional',
        emoji: 'ð£ï¸',
        descricao: 'Envie 1.000 mensagens.'
    },

    nivel5: {
        nome: 'Subindo de NÃ­vel',
        emoji: 'â­',
        descricao: 'Alcance o nÃ­vel 5.'
    },

    nivel10: {
        nome: 'Veterano',
        emoji: 'ð',
        descricao: 'Alcance o nÃ­vel 10.'
    },

    nivel25: {
        nome: 'Lenda',
        emoji: 'ð',
        descricao: 'Alcance o nÃ­vel 25.'
    }
};

const numeroOiAuto = '553298631752@c.us';

let oiAutoAtivo = new Map();


// ========================================
// ð¾ SISTEMA DE PERSISTÃNCIA
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
const arquivoRanks =
    `${pastaDados}/ranks.json`;

// Cria a pasta dados se ela nÃ£o existir
if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(
        pastaDados,
        { recursive: true }
    );
}


function obterConfigAdmin(grupoId) {
    if (!grupoId) return null;
    if (!configuracoesAdminGrupos.has(grupoId)) {
        configuracoesAdminGrupos.set(grupoId, {
            antilink: false,
            linksPermitidos: [],
            antiflood: false,
            floodLimite: 8,
            antiMention: false,
            antiPalavra: false,
            palavrasProibidas: [],
            listaBranca: [],
            autoBan: false,
            antiImg: false,
            antiVideo: false,
            antiAudio: false,
            antiDoc: false,
            antiSticker: false,
            antiCatalogo: false,
            limitexto: false,
            limiteTexto: 1000,
            welcome: false,
            goodbye: false,
            welcomeTexto: 'ð Bem-vindo, @pessoa! Divirta-se no grupo! ð',
            goodbyeTexto: 'ð @pessoa saiu do grupo. AtÃ© mais!',
            jogos: true,
            economia: true,
            xp: true,
            cmds: true,
            regras: '',
            prefixo: ';',
            multiprefix: false,
            logs: false,
            comandosAdmin: [],
            advertencias: {},
            anotacoes: [],
            autoresposta: false,
            respostasAutomaticas: [],
            horarioAbertura: null,
            horarioFechamento: null,
            ultimoHorarioGrupo: null
        });
    }
    return configuracoesAdminGrupos.get(grupoId);
}

function salvarConfigAdmin() {
    try {
        const dados = {};
        for (const [grupo, config] of configuracoesAdminGrupos) dados[grupo] = config;
        fs.writeFileSync(arquivoConfigAdmin, JSON.stringify(dados, null, 2), 'utf8');
    } catch (erro) {
        console.error('â Erro ao salvar configuraÃ§Ãµes administrativas:', erro.message);
    }
}

function carregarConfigAdmin() {
    try {
        if (!fs.existsSync(arquivoConfigAdmin)) return;
        const dados = JSON.parse(fs.readFileSync(arquivoConfigAdmin, 'utf8'));
        for (const [grupo, salvo] of Object.entries(dados)) {
            const base = obterConfigAdmin(grupo);
            Object.assign(base, salvo);
        }
        console.log('ð¾ ConfiguraÃ§Ãµes administrativas carregadas:', configuracoesAdminGrupos.size, 'grupos');
    } catch (erro) {
        console.error('â ï¸ Erro ao carregar configuraÃ§Ãµes administrativas:', erro.message);
    }
}

function registrarLogAdmin(message, acao, detalhes = '') {
    if (!message?.from?.endsWith('@g.us')) return;
    const config = obterConfigAdmin(message.from);
    if (!config.logs) return;
    const autor = obterIdRemetente(message) || message.author || message.from;
    if (!logsAdminGrupos.has(message.from)) logsAdminGrupos.set(message.from, []);
    const logs = logsAdminGrupos.get(message.from);
    logs.unshift({
        data: new Date().toISOString(),
        autor: String(autor),
        acao,
        detalhes: String(detalhes || '')
    });
    if (logs.length > 30) logs.length = 30;
}

function parseDuracao(texto) {
    const m = String(texto || '').trim().match(/^(\d+(?:\.\d+)?)(s|m|h)?$/i);
    if (!m) return null;
    const valor = Number(m[1]);
    const unidade = (m[2] || 'm').toLowerCase();
    const multiplicador = unidade === 'h' ? 3600000 : unidade === 's' ? 1000 : 60000;
    return Math.max(1000, Math.min(valor * multiplicador, 86400000));
}

function obterPrefixoGrupo(grupoId) {
    return grupoId && configuracoesAdminGrupos.has(grupoId)
        ? (configuracoesAdminGrupos.get(grupoId).prefixo || PREFIXO)
        : PREFIXO;
}

function formatarConfiguracaoAdmin(config) {
    const prefixo = config.prefixo || PREFIXO;
    const estado = valor => valor ? 'ð¢ ðð' : 'ð´ ððð';

    return `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â   *âï¸ ððððððððððÌ§ðÌð*
ââ¯
â
â  ð¡ï¸ *ðððððððÌ§ðÌð*
â
ââ¤ ð *${prefixo}config antilink on/off*
â   _Bloquear links no grupo._
ââ¤ ð *${prefixo}config antiflood on/off*
â   _Limitar excesso de mensagens._
ââ¤ ð¥ *${prefixo}config antimencao on/off*
â   _Bloquear marcaÃ§Ãµes._
ââ¤ ð¤¬ *${prefixo}config antipalavra on/off*
â   _Bloquear palavras cadastradas._
ââ¤ ð¨ *${prefixo}config autoban on/off*
â   _Expulsar automaticamente em infraÃ§Ãµes._
ââ¤ ð *${prefixo}config limitexto on/off*
â   _Limitar tamanho das mensagens._
â
ââ¯
â  ð¼ï¸ *ððððððð ðð ððÌððð*
â
ââ¤ ð¼ï¸ *${prefixo}config antiimg on/off*
ââ¤ ð¥ *${prefixo}config antivideo on/off*
ââ¤ ðµ *${prefixo}config antiaudio on/off*
ââ¤ ð *${prefixo}config antidoc on/off*
ââ¤ ð§© *${prefixo}config antisticker on/off*
ââ¤ ðï¸ *${prefixo}config anticatalogo on/off*
â   _Bloqueiam o respectivo tipo de mÃ­dia._
â
ââ¯
â  ð *ððððððð ð ðððÌðð*
â
ââ¤ ð *${prefixo}config welcome on/off*
ââ¤ ðª *${prefixo}config goodbye on/off*
â   _Ativar ou desativar mensagens de entrada/saÃ­da._
â
ââ¯
â  ð® *ðððððððð*
â
ââ¤ ð® *${prefixo}config jogos on/off*
ââ¤ ð° *${prefixo}config economia on/off*
ââ¤ â­ *${prefixo}config xp on/off*
ââ¤ ð *${prefixo}config cmds on/off*
â   _Controlar os sistemas do grupo._
â
ââ¯
â  ð  *ððððð*
â
ââ¤ ð£ *${prefixo}config multiprefix on/off*
ââ¤ ð£ *${prefixo}prefixo*
â   _Configurar o prefixo do grupo._
ââ¤ ð *${prefixo}regras*
â   _Consultar as regras do grupo._
ââ¤ ð *${prefixo}logs on/off*
â   _Registrar aÃ§Ãµes administrativas._
â
ââ¯
â  ð *ðððððð ð ððððððð*
â
ââ¤ ð¤¬ *${prefixo}config palavra add <palavra>*
ââ¤ ð¤¬ *${prefixo}config palavra remove <palavra>*
ââ¤ ð¤¬ *${prefixo}config palavra list*
ââ¤ ð¢ *${prefixo}config whitelist add @pessoa*
ââ¤ ð´ *${prefixo}config whitelist remove @pessoa*
ââ¤ ð¢ *${prefixo}config whitelist list*
ââ¤ ð *${prefixo}config limite <nÃºmero>*
ââ¤ ð *${prefixo}config flood <nÃºmero>*
â
ââ¯
â  ð *ððððÌðððð*
â
ââ¤ ð *${prefixo}opengp 06:00*
ââ¤ ð *${prefixo}closegp 22:00*
ââ¤ ð *${prefixo}time-status*
ââ¤ ðï¸ *${prefixo}rm_opengp*
â
ââ¯
â  ð¡ *ððð ðððððð*
â
ââ¤ *${prefixo}config moderacao*
ââ¤ *${prefixo}config midia*
ââ¤ *${prefixo}config entrada*
ââ¤ *${prefixo}config sistemas*
ââ¤ *${prefixo}config grupo*
ââ¤ *${prefixo}config listas*
â
ââ¯
â  â¹ï¸ *Prefixo atual:* *${prefixo}*
â  ${estado(config.multiprefix)} *Multiprefix*
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`;
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
                'ð¾ Mutados carregados:',
                mutados.size,
                'grupos'
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar mutados:',
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
                'ð¾ Blacklist carregada:',
                blacklistMute.size,
                'IDs'
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar blacklist:',
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
                'ð Casamentos carregados:',
                casamentos.size
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar casamentos:',
            erro.message
        );
    }


    // ========================================================
// ð¬ CARREGAR OI AUTO
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
        'â Erro ao carregar OI AUTO:',
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
                'ð Propostas carregadas:',
                propostasCasamento.size
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar propostas:',
            erro.message
        );
    }

    // FAMÃLIAS
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
                'ð¨âð©âð§ FamÃ­lias carregadas:',
                familias.size
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar famÃ­lias:',
            erro.message
        );
    }

        // ð¥ PARTICIPANTES DOS GRUPOS
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
                'ð¥ Participantes carregados:',
                participantesGrupos.size,
                'grupos'
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar participantes:',
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

        console.log('ð Avisos carregados com sucesso!');
    } catch (erro) {
        console.error('â Erro ao carregar avisos:', erro);
    }
}

// ============================================================
// ð¤ AFK
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
            'ð¤ AFKs carregados:',
            usuariosAFK.size
        );
    }

} catch (erro) {

    console.log(
        'â ï¸ Erro ao carregar AFKs:',
        erro.message
    );
}
    
    
// ð PIADAS
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
                'ð Piadas carregadas:',
                piadas.length
            );
        }

    } catch (erro) {

        console.log(
            'â ï¸ Erro ao carregar piadas:',
            erro.message
        );
    }
}
    

// ============================================================
// ð¤ SALVAR AFKs
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
            'ð¤ AFKs salvos!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar AFKs:',
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
            'ð¾ Mutados salvos!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar mutados:',
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
            'ð¾ Blacklist salva!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar blacklist:',
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
        console.error('â Erro ao salvar avisos:', erro);
    }
}

// ========================================================
// ð¾ SALVAR OI AUTO
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
            'ð¾ OI AUTO salvo com sucesso!'
        );

    } catch (erro) {

        console.error(
            'â Erro ao salvar OI AUTO:',
            erro
        );

    }
}

// ============================================================
// ð SALVAR CASAMENTOS
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
            'ð Casamentos salvos!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar casamentos:',
            erro.message
        );
    }
}


// ============================================================
// ð SALVAR PROPOSTAS
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
            'ð Propostas de casamento salvas!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar propostas:',
            erro.message
        );
    }
}

// ============================================================
// ð¨âð©âð§ SALVAR FAMÃLIAS
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
            'ð¨âð©âð§ FamÃ­lias salvas!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar famÃ­lias:',
            erro.message
        );
    }
}

// ============================================================
// ð¥ SALVAR PARTICIPANTES DOS GRUPOS
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
            'ð¾ Participantes dos grupos salvos!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar participantes:',
            erro.message
        );
    }
}

// ============================================================
// ð­ SISTEMA DE PERSONALIDADES
// ============================================================

const PERSONALIDADES = {
    normal: {
        nome: 'Normal',
        emoji: 'ð¤',
        descricao: 'Comportamento padrÃ£o do JUST BOT.',
        frase: ''
    },
    amigavel: {
        nome: 'AmigÃ¡vel',
        emoji: 'ð',
        descricao: 'Mais simpÃ¡tico e acolhedor.',
        frase: 'ð _Tamo junto!_'
    },
    fofa: {
        nome: 'Fofa',
        emoji: 'ð¥°',
        descricao: 'Carinhosa, doce e cheia de emojis.',
        frase: 'ð¥° _Espero ter ajudado! ð_'
    },
    sarcastica: {
        nome: 'SarcÃ¡stica',
        emoji: 'ð',
        descricao: 'Respostas com uma pitada de ironia.',
        frase: 'ð _Pronto. Agora pode fingir que nÃ£o sabia._'
    },
    caotica: {
        nome: 'CaÃ³tica',
        emoji: 'ð¤ª',
        descricao: 'Energia imprevisÃ­vel e respostas absurdas.',
        frase: 'ð¤ª _NÃ£o faÃ§o ideia do que aconteceu, mas gostei._'
    },
    seria: {
        nome: 'SÃ©ria',
        emoji: 'ð§',
        descricao: 'Mais direta, formal e objetiva.',
        frase: 'ð§ _OperaÃ§Ã£o concluÃ­da._'
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
        console.error('â Erro ao salvar personalidades:', erro);
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
        console.log('ð­ Personalidades carregadas:', personalidadesGrupos.size, 'grupos');
    } catch (erro) {
        console.error('â Erro ao carregar personalidades:', erro);
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
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nââ¯ *ððððððððððððð*\nâ\nââ¤ _Esse comando sÃ³ funciona em grupos._\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
            return;
        }

        if (!(await exigirAdmin(message))) return;

        const escolha = String(argumentos || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!escolha) {
            const atual = obterPersonalidadeGrupo(message.from);
            const atualDados = PERSONALIDADES[atual];
            let lista = '';
            for (const [id, personalidade] of Object.entries(PERSONALIDADES)) {
                lista += `ââ¤ ${personalidade.emoji} *${id}* â ${personalidade.descricao}\n`;
            }
            await reagir(message, 'ð­');
            await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nâ      *ððððððððððððð*\nââ¯\nâ\nââ¤ ð­ Atual: *${atualDados.nome}*\nâ\n${lista}\nââ¯\nâ\nââ¤ *ðððð:*\nâ   *${PREFIXO}personalidade <nome>*\nâ\nââ¤ *ððððððð:*\nâ   *${PREFIXO}personalidade sarcastica*\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
            return;
        }

        if (['desligar', 'desativar', 'off'].includes(escolha)) {
            personalidadesGrupos.delete(message.from);
            salvarPersonalidades();
            await reagir(message, 'ð´');
            await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nââ¯ *ððððððððððððð*\nâ\nââ¤ ð´ _Personalidade desativada._\nââ¤ O JUST BOT voltou ao comportamento *Normal*.\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
            return;
        }

        const personalidade = PERSONALIDADES[escolha];
        if (!personalidade) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nââ¯ *ððððððððððððð ððððÌðððð*\nâ\nââ¤ _Essa personalidade nÃ£o existe._\nâ\nââ¤ Use *${PREFIXO}personalidades* para ver as opÃ§Ãµes.\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
            return;
        }

        personalidadesGrupos.set(message.from, escolha);
        salvarPersonalidades();
        await reagir(message, personalidade.emoji);
        await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nââ¯ *ððððððððððððð ððððð*\nâ\nââ¤ ${personalidade.emoji} *${personalidade.nome}*\nâ\nââ¤ _${personalidade.descricao}_\nâ\nââ¤ Essa personalidade agora estÃ¡ ativa neste grupo.\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro ao definir personalidade:', erro);
        await reagir(message, 'â');
    }
}

async function listarPersonalidades(message) {
    const atual = obterPersonalidadeGrupo(message.from);
    const atualDados = PERSONALIDADES[atual];
    let lista = '';
    for (const [id, personalidade] of Object.entries(PERSONALIDADES)) {
        const marcador = id === atual ? 'â' : 'â«ï¸';
        lista += `ââ¤ ${marcador} ${personalidade.emoji} *${id}*\nâ   _${personalidade.descricao}_\n`;
    }
    await reagir(message, 'ð­');
    await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nâ      *ðððððððððððððð*\nââ¯\nâ\nââ¤ ð­ Atual: *${atualDados.nome}*\nâ\n${lista}\nââ¯\nâ\nââ¤ Para alterar, um administrador deve usar:\nâ   *${PREFIXO}personalidade <nome>*\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
}

carregarPersonalidades();

// Carrega tudo ao iniciar
// ============================================================
// ð SISTEMA SOMENTE ADM
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
            'ð Grupos em modo somente ADM carregados:',
            soAdmGrupos.size
        );
    } catch (erro) {
        console.error('â ï¸ Erro ao carregar modo somente ADM:', erro.message);
    }
}

function salvarSoAdm() {
    try {
        fs.writeFileSync(
            arquivoSoAdm,
            JSON.stringify([...soAdmGrupos], null, 2),
            'utf8'
        );

        console.log('ð¾ Modo somente ADM salvo!');
    } catch (erro) {
        console.error('â Erro ao salvar modo somente ADM:', erro.message);
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
            'â Erro ao verificar administrador no modo somente ADM:',
            erro
        );
        return false;
    }
}

async function soAdm(message) {
    try {
        const chatId = message?.from;

        if (!chatId || !chatId.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(
                message,
                'â _O ;soadm sÃ³ funciona em grupos._'
            );
            return;
        }

        const admin = await usuarioEhAdminDoGrupo(message);

        if (!admin) {
            await reagir(message, 'â');
            await responderCitando(
                message,
                'â _Apenas administradores do grupo podem ativar ou desativar o modo somente ADM._'
            );
            return;
        }

        if (soAdmGrupos.has(chatId)) {
            soAdmGrupos.delete(chatId);
            salvarSoAdm();

            await reagir(message, 'ð');
            await responderCitando(
                message,
                `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ððððððð ððð ðððððððððð*
â
ââ¤ _Todos os membros podem usar os comandos novamente._
â
ââ¤ ð _Administradores continuam sujeitos Ã s permissÃµes especÃ­ficas de cada comando._
â
âââ¢âà¼ºðà¼»ââ¢ââ`
            );
            return;
        }

        soAdmGrupos.add(chatId);
        salvarSoAdm();

        await reagir(message, 'ð');
        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ððððððð ððð ððððððð*
â
ââ¤ ð _Agora apenas administradores do grupo podem usar os comandos._
â
ââ¤ ð _Use ${PREFIXO}soadm novamente para desativar._
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );
    } catch (erro) {
        console.error('â Erro no modo somente ADM:', erro);
        await reagir(message, 'â');
        await responderCitando(
            message,
            'â _NÃ£o foi possÃ­vel alterar o modo somente ADM._'
        );
    }
}

carregarDados();
carregarConfigAdmin();

// ============================================================
// ð SISTEMA DE RANKS VARIADOS
// ============================================================

function obterConfiguracaoRank(grupoId) {
    if (!configuracoesRanks.has(grupoId)) {
        configuracoesRanks.set(grupoId, {
            modo: 'aleatorio',
            exibicao: 'individual',
            quantidadeTop: 5,
            mostrarPorcentagem: true,
            fixos: {}
        });
    }
    return configuracoesRanks.get(grupoId);
}

function salvarConfiguracoesRanks() {
    try {
        fs.writeFileSync(
            arquivoRanks,
            JSON.stringify(Object.fromEntries(configuracoesRanks), null, 2),
            'utf8'
        );
    } catch (erro) {
        console.error('â Erro ao salvar configuraÃ§Ãµes de ranks:', erro);
    }
}

function carregarConfiguracoesRanks() {
    try {
        if (!fs.existsSync(arquivoRanks)) return;
        const dados = JSON.parse(fs.readFileSync(arquivoRanks, 'utf8'));
        if (!dados || typeof dados !== 'object') return;

        configuracoesRanks.clear();
        for (const [grupoId, configuracao] of Object.entries(dados)) {
            if (!grupoId || !grupoId.endsWith('@g.us')) continue;
            configuracoesRanks.set(grupoId, {
                modo: configuracao?.modo === 'fixo' ? 'fixo' : 'aleatorio',
                exibicao: configuracao?.exibicao === 'top' ? 'top' : 'individual',
                quantidadeTop: Math.min(50, Math.max(1, Number(configuracao?.quantidadeTop) || 5)),
                mostrarPorcentagem: configuracao?.mostrarPorcentagem !== false,
                fixos: configuracao?.fixos && typeof configuracao.fixos === 'object'
                    ? configuracao.fixos
                    : {}
            });
        }
        console.log('ð ConfiguraÃ§Ãµes de ranks carregadas:', configuracoesRanks.size);
    } catch (erro) {
        console.error('â Erro ao carregar configuraÃ§Ãµes de ranks:', erro);
    }
}

carregarConfiguracoesRanks();

const DEFINICOES_RANK = {
    ranklindo: {
        titulo: 'ðððð ððððð',
        emoji: 'ð',
        descricao: 'nÃ­vel de beleza do cidadÃ£o',
        comentario: valor => valor >= 90 ? 'Uma ameaÃ§a Ã  autoestima alheia. â¨' : valor >= 70 ? 'Bonito(a) com certificado do bot. ð' : valor >= 50 ? 'Tem seu charme. ð' : 'A beleza estÃ¡ em manutenÃ§Ã£o. ð ï¸'
    },
    rankfeio: {
        titulo: 'ðððð ðððð',
        emoji: 'ð¹',
        descricao: 'nÃ­vel de feiura detectado',
        comentario: valor => valor >= 90 ? 'O espelho pediu demissÃ£o. ð­' : valor >= 70 ? 'O departamento de estÃ©tica entrou em alerta. ð¨' : valor >= 50 ? 'Uma feiura respeitÃ¡vel. ð¤¨' : 'Quase escapou ileso. ð'
    },
    rankgay: {
        titulo: 'ðððð ððð',
        emoji: 'ð³ï¸âð',
        descricao: 'Ã­ndice aleatÃ³rio deste rank',
        comentario: valor => valor >= 90 ? 'O arco-Ã­ris chegou antes. ð' : valor >= 70 ? 'O radar detectou fortes sinais de brilho. â¨' : valor >= 50 ? 'O radar estÃ¡ indeciso. ð¡' : 'O radar quase nÃ£o apitou. ð»'
    },
    rankhetero: {
        titulo: 'ðððð ðððððð',
        emoji: 'ð',
        descricao: 'Ã­ndice aleatÃ³rio deste rank',
        comentario: valor => valor >= 90 ? 'O radar hetero estÃ¡ em Ã³rbita. ð°ï¸' : valor >= 70 ? 'O radar marcou presenÃ§a. ð¡' : valor >= 50 ? 'SituaÃ§Ã£o indefinida no radar. ð¤' : 'O radar estÃ¡ praticamente desligado. ð´'
    },
    ranklesbico: {
        titulo: 'ðððð ððððððð',
        emoji: 'ð',
        descricao: 'Ã­ndice aleatÃ³rio deste rank',
        comentario: valor => valor >= 90 ? 'O radar roxo entrou em combustÃ£o. ð' : valor >= 70 ? 'O radar captou sinais fortes. ð¡' : valor >= 50 ? 'O radar estÃ¡ analisando. ð' : 'Poucos sinais detectados. ð»'
    },
    rankinteligente: {
        titulo: 'ðððð ððððððððððð',
        emoji: 'ð§ ',
        descricao: 'nÃ­vel de inteligÃªncia do cidadÃ£o',
        comentario: valor => valor >= 90 ? 'Einstein acaba de ganhar concorrÃªncia. ð§ ' : valor >= 70 ? 'Processador mental acima da mÃ©dia. â¡' : valor >= 50 ? 'Funcionando dentro dos parÃ¢metros. ð' : 'O cÃ©rebro estÃ¡ em modo economia de energia. ð'
    }
};

function normalizarChaveRank(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80) || 'rank';
}

function obterValorRank(grupoId, tipo, idPessoa) {
    const configuracao = obterConfiguracaoRank(grupoId);
    const chave = `${tipo}:${idPessoa}`;

    if (configuracao.modo === 'fixo') {
        if (!Number.isFinite(Number(configuracao.fixos[chave]))) {
            configuracao.fixos[chave] = crypto.randomInt(0, 101);
            salvarConfiguracoesRanks();
        }
        return Number(configuracao.fixos[chave]);
    }

    return crypto.randomInt(0, 101);
}

function obterValorRankPar(grupoId, tipo, ids) {
    const pares = [...new Set((ids || []).filter(Boolean).map(String))].sort();
    const chavePar = pares.join('|');
    const configuracao = obterConfiguracaoRank(grupoId);
    const chave = `${tipo}:${chavePar}`;

    if (configuracao.modo === 'fixo') {
        if (!Number.isFinite(Number(configuracao.fixos[chave]))) {
            configuracao.fixos[chave] = crypto.randomInt(0, 101);
            salvarConfiguracoesRanks();
        }
        return Number(configuracao.fixos[chave]);
    }

    return crypto.randomInt(0, 101);
}

async function obterParticipantesDoGrupoParaRank(message) {
    if (!message?.from?.endsWith('@g.us')) return [];

    try {
        const dados = await client.pupPage.evaluate(async chatId => {
            try {
                const Store = window.require('WAWebCollections');
                const chat = Store.Chat.get(chatId);
                const participantes = chat?.groupMetadata?.participants;
                let modelos = [];
                if (typeof participantes?.getModelsArray === 'function') {
                    modelos = participantes.getModelsArray();
                } else if (Array.isArray(participantes?.models)) {
                    modelos = participantes.models;
                }
                return modelos.map(p => p.id?._serialized || p.id?.toString?.()).filter(Boolean);
            } catch (erro) {
                return [];
            }
        }, message.from);
        return [...new Set(dados || [])];
    } catch (erro) {
        console.log('â ï¸ Erro ao obter participantes para rank:', erro.message);
        return [];
    }
}

async function comandoRankVariado(message, tipo) {
    try {
        if (!message?.from?.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ððððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
            return;
        }

        const definicao = DEFINICOES_RANK[tipo];
        if (!definicao) return;
        const configuracao = obterConfiguracaoRank(message.from);

        if (configuracao.exibicao === 'top') {
            const ids = await obterParticipantesDoGrupoParaRank(message);
            if (!ids.length) {
                await reagir(message, 'â');
                await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ
ââ¯ *ðððð ðð ððððð*
â
ââ¤ _NÃ£o consegui obter os participantes do grupo agora._
â
âââ¢âà¼ºâà¼»ââ¢ââ`);
                return;
            }

            const resultados = ids.map(id => ({ id, valor: obterValorRank(message.from, tipo, id) }));
            resultados.sort((a, b) => b.valor - a.valor || a.id.localeCompare(b.id));
            const top = resultados.slice(0, configuracao.quantidadeTop);
            const idsMencao = top.map(item => item.id);
            const medalhas = ['ð¥', 'ð¥', 'ð¥'];
            let texto = `âââ¢âà¼º${definicao.emoji}à¼»ââ¢ââ
â       *${definicao.titulo}*
ââ¯
â
ââ¤ ð *TOP ${top.length} DO GRUPO*
â
`;
            top.forEach((item, i) => {
                const medalha = medalhas[i] || `${i + 1}Âº`;
                const percentual = configuracao.mostrarPorcentagem ? ` *${item.valor}%*` : '';
                texto += `ââ¤ ${medalha} ${mencaoDaPessoa(item.id)}${percentual}
â   ${definicao.comentario(item.valor)}
â
`;
            });
            texto += `âââ¢âà¼º${definicao.emoji}à¼»ââ¢ââ`;
            await reagir(message, definicao.emoji);
            await enviarComMencoes(message.from, texto, { mentions: idsMencao });
            return;
        }

        const pessoa = await obterAlvoComContato(message, false);
        const idPessoa = pessoa ? idDaPessoa(pessoa) : obterIdRemetente(message);
        if (!idPessoa) return;
        const valor = obterValorRank(message.from, tipo, idPessoa);
        const nome = pessoa ? mencaoDaPessoa(pessoa) : mencaoDaPessoa(idPessoa);
        const percentual = configuracao.mostrarPorcentagem ? ` *${valor}%*` : '';
        await reagir(message, definicao.emoji);
        await responderComMencoes(message, `âââ¢âà¼º${definicao.emoji}à¼»ââ¢ââ
â       *${definicao.titulo}*
ââ¯
â
ââ¤ ð¤ ${nome}
ââ¤ ð ${definicao.descricao}:${percentual}
â
ââ¤ ${definicao.comentario(valor)}
â
âââ¢âà¼º${definicao.emoji}à¼»ââ¢ââ`, { mentions: [idPessoa] });
    } catch (erro) {
        console.error(`â Erro no ${tipo}:`, erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ
ââ¯ *ðððð ðð ðððð*
â
ââ¤ _NÃ£o consegui gerar este rank agora._
â
âââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

function obterValorRankCustomizado(grupoId, criterio, idPessoa) {
    const configuracao = obterConfiguracaoRank(grupoId);
    const chave = `custom:${normalizarChaveRank(criterio)}:${idPessoa}`;
    if (configuracao.modo === 'fixo') {
        if (!Number.isFinite(Number(configuracao.fixos[chave]))) {
            configuracao.fixos[chave] = crypto.randomInt(0, 101);
            salvarConfiguracoesRanks();
        }
        return Number(configuracao.fixos[chave]);
    }
    return crypto.randomInt(0, 101);
}

async function comandoRankCustomizado(message, argumentos) {
    const textoRank = String(argumentos || '').trim();
    if (!textoRank) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºð¨à¼»ââ¢ââ
ââ¯ *ðððð ððððððððððð*
â
ââ¤ _Digite o que deseja avaliar._
â
ââ¤ *Exemplo:* ${PREFIXO}csrank engraÃ§ado
â
âââ¢âà¼ºð¨à¼»ââ¢ââ`);
        return;
    }
    if (!message?.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºð¨à¼»ââ¢ââ
ââ¯ *ðððð ððððððððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºð¨à¼»ââ¢ââ`);
        return;
    }

    const configuracao = obterConfiguracaoRank(message.from);
    if (configuracao.exibicao === 'top') {
        const ids = await obterParticipantesDoGrupoParaRank(message);
        if (!ids.length) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ
ââ¯ *ðððð ððððððððððð*
â
ââ¤ _NÃ£o consegui obter os participantes do grupo agora._
â
âââ¢âà¼ºâà¼»ââ¢ââ`);
            return;
        }
        const resultados = ids.map(id => ({ id, valor: obterValorRankCustomizado(message.from, textoRank, id) }));
        resultados.sort((a, b) => b.valor - a.valor || a.id.localeCompare(b.id));
        const top = resultados.slice(0, configuracao.quantidadeTop);
        const idsMencao = top.map(item => item.id);
        const medalhas = ['ð¥', 'ð¥', 'ð¥'];
        let texto = `âââ¢âà¼ºð¨à¼»ââ¢ââ
â       *ðððð ððððððððððð*
ââ¯
â
ââ¤ ð¯ CritÃ©rio: *${textoRank}*
ââ¤ ð *TOP ${top.length} DO GRUPO*
â
`;
        top.forEach((item, i) => {
            const medalha = medalhas[i] || `${i + 1}Âº`;
            const percentual = configuracao.mostrarPorcentagem ? ` *${item.valor}%*` : '';
            texto += `ââ¤ ${medalha} ${mencaoDaPessoa(item.id)}${percentual}
â   ${item.valor >= 90 ? 'NÃ­vel absurdo. ð¤¯' : item.valor >= 70 ? 'Resultado forte. ð' : item.valor >= 50 ? 'Resultado mediano, mas respeitÃ¡vel. ð' : 'Tem espaÃ§o para evoluÃ§Ã£o. ð ï¸'}
â
`;
        });
        texto += `âââ¢âà¼ºð¨à¼»ââ¢ââ`;
        await reagir(message, 'ð¨');
        await enviarComMencoes(message.from, texto, { mentions: idsMencao });
        return;
    }

    const idPessoa = obterIdRemetente(message);
    if (!idPessoa) return;
    const valor = obterValorRankCustomizado(message.from, textoRank, idPessoa);
    const nome = mencaoDaPessoa(idPessoa);
    const percentual = configuracao.mostrarPorcentagem ? ` *${valor}%*` : '';
    const comentario = valor >= 90 ? 'NÃ­vel absurdo. O bot ficou impressionado. ð¤¯' : valor >= 70 ? 'Resultado forte. ð' : valor >= 50 ? 'Resultado mediano, mas respeitÃ¡vel. ð' : 'Tem espaÃ§o para evoluÃ§Ã£o. ð ï¸';
    await reagir(message, 'ð¨');
    await responderComMencoes(message, `âââ¢âà¼ºð¨à¼»ââ¢ââ
â       *ðððð ððððððððððð*
ââ¯
â
ââ¤ ð¤ ${nome}
ââ¤ ð¯ CritÃ©rio: *${textoRank}*
ââ¤ ð Resultado:${percentual}
â
ââ¤ ${comentario}
â
âââ¢âà¼ºð¨à¼»ââ¢ââ`, { mentions: [idPessoa] });
}

async function comandoRankPobre(message) {
    try {
        if (!message?.from?.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºðªà¼»ââ¢ââ
ââ¯ *ðððð ððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðªà¼»ââ¢ââ`);
            return;
        }
        const configuracao = obterConfiguracaoRank(message.from);
        if (configuracao.exibicao === 'individual') {
            const idPessoa = obterIdRemetente(message);
            const canonico = await resolverIdEconomia(idPessoa);
            const carteira = canonico ? obterCarteiraEconomia(canonico) : null;
            const saldo = Number(carteira?.saldo) || 0;
            await reagir(message, 'ðª');
            await responderComMencoes(message, `âââ¢âà¼ºðªà¼»ââ¢ââ\nâ       *ðððð ððððð*\nââ¯\nâ\nââ¤ ð¤ ${mencaoDaPessoa(idPessoa)}\nââ¤ ðª Saldo: *${formatarMoedas(saldo)} moedas*\nâ\nââ¤ _Modo pessoal: apenas seu resultado Ã© exibido._\nâ\nâââ¢âà¼ºðªà¼»ââ¢ââ`, { mentions: [idPessoa] });
            return;
        }
        const ids = await obterParticipantesDoGrupoParaRank(message);
        const participantes = [];
        for (const id of ids) {
            const canonico = await resolverIdEconomia(id);
            const carteira = canonico ? obterCarteiraEconomia(canonico) : null;
            participantes.push({ id, saldo: Number(carteira?.saldo) || 0 });
        }
        if (!participantes.length) {
            await reagir(message, 'ðª');
            await responderCitando(message, `âââ¢âà¼ºðªà¼»ââ¢ââ
â       *ðððð ððððð*
ââ¯
â
ââ¤ ð _Ainda nÃ£o hÃ¡ carteiras suficientes no grupo._
â
âââ¢âà¼ºðªà¼»ââ¢ââ`);
            return;
        }
        participantes.sort((a, b) => a.saldo - b.saldo || a.id.localeCompare(b.id));
        const top = participantes.slice(0, configuracao.quantidadeTop);
        const idsMencao = top.map(item => item.id);
        let texto = `âââ¢âà¼ºðªà¼»ââ¢ââ
â       *ðððð ððððð*
ââ¯
â
ââ¤ ð *TOP ${top.length} DO GRUPO*
ââ¤ _Ranking baseado nas moedas do bot._
â
`;
        const medalhas = ['ð¥', 'ð¥', 'ð¥'];
        top.forEach((item, i) => {
            const medalha = medalhas[i] || `${i + 1}Âº`;
            texto += `ââ¤ ${medalha} ${mencaoDaPessoa(item.id)}
â   ðª *${formatarMoedas(item.saldo)} moedas*
â
`;
        });
        texto += `âââ¢âà¼ºðªà¼»ââ¢ââ`;
        await reagir(message, 'ðª');
        await enviarComMencoes(message.from, texto, { mentions: idsMencao });
    } catch (erro) {
        console.error('â Erro no rank pobre:', erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ
ââ¯ *ðððð ðð ðððð*
â
ââ¤ _NÃ£o consegui consultar as moedas do grupo._
â
âââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

async function comandoRankShip(message) {
    try {
        if (!message?.from?.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ðððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
            return;
        }

        const mencionados = [...new Set(message.mentionedIds || [])];
        const pessoas = [...mencionados];
        if (pessoas.length < 2 && message.hasQuotedMsg) {
            try {
                const citada = await message.getQuotedMessage();
                const id = citada?.author || citada?.from;
                if (id && id !== message.from && !pessoas.includes(id)) pessoas.push(id);
            } catch {}
        }

        if (pessoas.length < 2) {
            const participantes = await obterParticipantesDoGrupoParaRank(message);
            const disponiveis = participantes.filter(id => !idsIguais(id, obterIdRemetente(message)));
            if (disponiveis.length >= 2) {
                const primeira = disponiveis[crypto.randomInt(0, disponiveis.length)];
                let segunda = primeira;
                while (idsIguais(segunda, primeira)) {
                    segunda = disponiveis[crypto.randomInt(0, disponiveis.length)];
                }
                pessoas.push(primeira, segunda);
            }
        }

        if (pessoas.length < 2) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ðððð*
â
ââ¤ _Mencione duas pessoas para fazer o ship._
â
ââ¤ *Exemplo:* ${PREFIXO}rankship @pessoa1 @pessoa2
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
            return;
        }

        const ids = pessoas.slice(0, 2);
        const valor = obterValorRankPar(message.from, 'ship', ids);
        const comentarios = valor >= 90 ? 'Casamento marcado pelo algoritmo. ð' : valor >= 70 ? 'Tem quÃ­mica! ðâ¤ï¸' : valor >= 50 ? 'Existe alguma faÃ­sca escondida. â¨' : valor >= 25 ? 'O algoritmo estÃ¡ vendo amizade. ð' : 'O ship afundou antes de zarpar. ð¢ð';
        const mencao1 = mencaoDaPessoa(ids[0]);
        const mencao2 = mencaoDaPessoa(ids[1]);

        await reagir(message, 'ð');
        await enviarComMencoes(
            message.from,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â        *ðððð ðððð*
ââ¯
â
ââ¤ ð ${mencao1} Ã ${mencao2}
ââ¤ ð Compatibilidade: *${valor}%*
â
ââ¤ ${comentarios}
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
            { mentions: ids }
        );
    } catch (erro) {
        console.error('â Erro no rank ship:', erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ
ââ¯ *ðððð ðð ðððð*
â
ââ¤ _NÃ£o consegui calcular esse ship agora._
â
âââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

async function mostrarConfiguracoesRanks(message) {
    if (!message?.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððððððððÃÃð ðð ððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }
    if (!(await exigirAdmin(message))) return;

    const c = obterConfiguracaoRank(message.from);
    const exibicao = c.exibicao === 'top' ? `ð TOP ${c.quantidadeTop} DO GRUPO` : 'ð¤ APENAS VOCÃ';
    const sorteio = c.modo === 'fixo' ? 'ð FIXO' : 'ð² ALEATÃRIO';
    const porcentagem = c.mostrarPorcentagem ? 'ð¢ ATIVADA' : 'ð´ DESATIVADA';

    await reagir(message, 'âï¸');
    await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â       *ðððððð ðð ðððððððð*
ââ¯
â
â  ð *ðððððððððÃðÌð ððððð*
â
ââ¤ ð ExibiÃ§Ã£o: *${exibicao}*
ââ¤ ð¢ Tamanho do TOP: *${c.quantidadeTop}*
ââ¤ ð² Resultados: *${sorteio}*
ââ¤ ð Porcentagem: *${porcentagem}*
â
ââ¯
â
â  ð ï¸ *ðððððÃðÌð*
â
ââ¤ ð *${PREFIXO}srank top*
â   _Mostra os melhores do grupo._
â
ââ¤ ð¤ *${PREFIXO}srank pessoal*
â   _Mostra apenas o seu resultado._
â
ââ¤ ð¢ *${PREFIXO}srank qtd 10*
â   _Define o TOP entre 1 e 50._
â
ââ¯
â
â  ð² *ðððððððððð*
â
ââ¤ ð *${PREFIXO}srank fixo*
â   _MantÃ©m os resultados salvos._
â
ââ¤ ð² *${PREFIXO}srank aleatorio*
â   _Sorteia novamente a cada uso._
â
ââ¯
â
â  ð *ððððððððððð*
â
ââ¤ ð¢ *${PREFIXO}srank porcentagem on*
â   _Exibe a porcentagem._
â
ââ¤ ð´ *${PREFIXO}srank porcentagem off*
â   _Oculta a porcentagem._
â
ââ¯
â
ââ¤ ð¾ _ConfiguraÃ§Ãµes salvas por grupo._
ââ¤ ð _Somente administradores podem alterar._
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`);
}

async function configurarRanksPorComando(message, argumentos) {
    if (!message?.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððððððððÃÃð ðð ððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }
    if (!(await exigirAdmin(message))) return;
    const partes = String(argumentos || '').trim().split(/\s+/).filter(Boolean);
    const acao = (partes[0] || '').toLowerCase();
    const c = obterConfiguracaoRank(message.from);

    if (acao === 'top') c.exibicao = 'top';
    else if (acao === 'pessoal' || acao === 'individual') c.exibicao = 'individual';
    else if (acao === 'qtd' || acao === 'quantidade' || acao === 'topqtd') {
        const n = Number(partes[1]);
        if (!Number.isInteger(n) || n < 1 || n > 50) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºð¢à¼»ââ¢ââ
ââ¯ *ðððððððððð ðð ððð*
â
ââ¤ _Use um nÃºmero inteiro entre 1 e 50._
ââ¤ *Exemplo:* ${PREFIXO}srank qtd 10
â
âââ¢âà¼ºð¢à¼»ââ¢ââ`);
            return;
        }
        c.quantidadeTop = n;
    } else if (acao === 'porcentagem' || acao === 'porcentagens' || acao === 'percentual') {
        const valor = (partes[1] || '').toLowerCase();
        if (!['on','off','sim','nao','nÃ£o','true','false'].includes(valor)) {
            await reagir(message, 'â');
            await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ððððððððððð*
â
ââ¤ _Use on/off._
ââ¤ *Exemplo:* ${PREFIXO}srank porcentagem off
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
            return;
        }
        c.mostrarPorcentagem = ['on', 'sim', 'true'].includes(valor);
    } else if (acao === 'fixo') c.modo = 'fixo';
    else if (acao === 'aleatorio' || acao === 'aleatÃ³rio' || acao === 'random') c.modo = 'aleatorio';
    else {
        await mostrarConfiguracoesRanks(message);
        return;
    }

    salvarConfiguracoesRanks();
    const rotulo = acao === 'top' ? `ð TOP ${c.quantidadeTop} DO GRUPO` : acao === 'pessoal' || acao === 'individual' ? 'ð¤ APENAS VOCÃ' : acao.startsWith('qtd') || acao === 'quantidade' || acao === 'topqtd' ? `ð¢ TOP ${c.quantidadeTop}` : acao.startsWith('porcent') || acao === 'percentual' ? `ð PORCENTAGEM ${c.mostrarPorcentagem ? 'ATIVADA' : 'DESATIVADA'}` : c.modo === 'fixo' ? 'ð MODO FIXO' : 'ð² MODO ALEATÃRIO';
    await reagir(message, 'â');
    await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â       *ððððð ððððððððððð*
ââ¯
â
ââ¤ â ${rotulo}
ââ¤ ð¾ _ConfiguraÃ§Ã£o salva para este grupo._
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`);
}

async function configurarModoRank(message, modo) {
    if (!message?.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððð ððð ððððð*
â
ââ¤ â _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }
    if (!(await exigirAdmin(message))) return;

    const configuracao = obterConfiguracaoRank(message.from);
    configuracao.modo = modo === 'fixo' ? 'fixo' : 'aleatorio';
    salvarConfiguracoesRanks();

    const fixo = configuracao.modo === 'fixo';
    await reagir(message, fixo ? 'ð' : 'ð²');
    await responderCitando(message, `âââ¢âà¼º${fixo ? 'ð' : 'ð²'}à¼»ââ¢ââ
â       *ðððð ððð ððððð*
ââ¯
â
ââ¤ ${fixo ? 'ð' : 'ð²'} Modo atual: *${fixo ? 'FIXO' : 'ALEATÃRIO'}*
â
ââ¤ ${fixo ? '_A mesma pessoa manterÃ¡ o mesmo resultado em cada rank._' : '_Os resultados serÃ£o sorteados novamente a cada uso._'}
â
ââ¤ ð _Apenas administradores podem alterar esta opÃ§Ã£o._
â
âââ¢âà¼º${fixo ? 'ð' : 'ð²'}à¼»ââ¢ââ`);
}

// ============================================================
// â¨ SISTEMA DE XP
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
            'â Erro ao salvar XP:',
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
            'â¨ Sistema de XP carregado!'
        );

    } catch (erro) {

        console.error(
            'â Erro ao carregar XP:',
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
        console.error('â Erro ao salvar economia:', erro);
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

        console.log('ð° Economia carregada:', moedasUsuarios.size, 'usuÃ¡rios');
    } catch (erro) {
        console.error('â Erro ao carregar economia:', erro);
    }
}

// ============================================================
// ðªª IDENTIDADE DAS CARTEIRAS
// MantÃ©m LID e JID da mesma pessoa na mesma carteira.
// Nunca assume que dois nÃºmeros sÃ£o iguais sem confirmaÃ§Ã£o do WhatsApp.
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
        console.log('â ï¸ NÃ£o foi possÃ­vel resolver identidade da carteira:', erro?.message || erro);
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
        nome: 'Picareta ReforÃ§ada',
        emoji: 'âï¸',
        preco: 1200,
        descricao: 'Reduz o cooldown da mineraÃ§Ã£o e aumenta seus ganhos.'
    },
    luvas: {
        nome: 'Luvas de LadrÃ£o',
        emoji: 'ð¥·',
        preco: 1500,
        descricao: 'Aumenta sua chance de escapar quando tentar roubar.'
    },
    colete: {
        nome: 'Colete Anti-PuniÃ§Ã£o',
        emoji: 'ð¡ï¸',
        preco: 2000,
        descricao: 'Protege uma vez contra a puniÃ§Ã£o de ser pego duas vezes.'
    }
};

carregarMoedas();

carregarXP();

// ============================================================
// ðï¸ CARREGAR CONQUISTAS
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
            'ðï¸ Conquistas carregadas:',
            conquistasUsuarios.size,
            'usuÃ¡rios'
        );

    } catch (erro) {

        console.error(
            'â Erro ao carregar conquistas:',
            erro
        );
    }
}


// ============================================================
// ðï¸ SALVAR CONQUISTAS
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
            'â Erro ao salvar conquistas:',
            erro
        );
    }
}


carregarConquistas();

// ============================================================
// ðï¸ DADOS DE CONQUISTAS DO USUÃRIO
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
// ðï¸ VERIFICAR SE USUÃRIO POSSUI CONQUISTA
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
// ðï¸ DESBLOQUEAR CONQUISTA
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
        `ðï¸ Conquista desbloqueada: ${conquista.nome} â ${usuarioId}`
    );

    return true;
}

// ============================================================
// ðï¸ VERIFICAR CONQUISTAS DO USUÃRIO
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
    // ð± PRIMEIRO PASSO
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
    // ð¬ TAGARELA
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
// ð£ï¸ FALADOR PROFISSIONAL
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
// â­ SUBINDO DE NÃVEL
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
// ð VETERANO
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
// ð LENDA
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
// ð¤ CONTROLE DE XP OFFLINE
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
            'â Erro ao salvar controle do XP:',
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
            'ð¤ Controle de XP offline carregado!'
        );

    } catch (erro) {

        console.error(
            'â Erro ao carregar controle de XP:',
            erro
        );
    }
}

carregarControleXP();


// ============================================================
// ð¤ OBTER MENSAGENS DO GRUPO DIRETAMENTE DO WHATSAPP WEB
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
                                    'WAWebCollections nÃ£o disponÃ­vel.'
                            };
                        }

                        const Chat =
                            Collections.Chat;

                        if (!Chat) {
                            return {
                                sucesso: false,
                                erro:
                                    'ColeÃ§Ã£o Chat nÃ£o disponÃ­vel.'
                            };
                        }

                        // ====================================================
                        // TENTAR PEGAR O CHAT DIRETAMENTE DA COLEÃÃO
                        // ====================================================

                        let chat =
                            Chat.get(chatId);

                        // Caso nÃ£o esteja carregado,
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
                                    'â ï¸ Chat.find falhou:',
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
                                    'Grupo nÃ£o encontrado na coleÃ§Ã£o do WhatsApp.'
                            };
                        }

                        // ====================================================
                        // PEGAR MENSAGENS JÃ CARREGADAS
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
                                    'â ï¸ NÃ£o foi possÃ­vel carregar mensagens antigas:',
                                    String(
                                        erroHistorico?.message ||
                                        erroHistorico
                                    )
                                );
                            }
                        }

                        // ====================================================
                        // LIMITAR ÃS ÃLTIMAS MENSAGENS
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
                `â ï¸ NÃ£o foi possÃ­vel obter mensagens do grupo ${grupoId}:`,
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
            `â Erro ao acessar mensagens diretamente do grupo ${grupoId}:`,
            erro
        );

        return [];
    }
}

// ============================================================
// ð¤ PROCESSAR MENSAGENS ENVIADAS ENQUANTO O BOT ESTAVA OFFLINE
// ============================================================

async function processarXPOffline() {

    console.log(
        'ð¤ Verificando mensagens enviadas enquanto o bot estava offline...'
    );

    try {

        let totalMensagens = 0;
        let totalXP = 0;

        // Usa os grupos que o prÃ³prio bot jÃ¡ conhece
        const gruposConhecidos =
            [...participantesGrupos.keys()];

        console.log(
            `ð¤ Grupos conhecidos para XP: ${gruposConhecidos.length}`
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
                        `ð¤ Primeiro registro de XP para ${grupoId}`
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
                        `ð¤ Nenhuma mensagem disponÃ­vel no grupo ${grupoId}.`
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

                    // Ignorar mensagens do prÃ³prio bot
                    if (
                        mensagem.fromMe
                    ) {
                        continue;
                    }

                    // Ignorar notificaÃ§Ãµes do sistema
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
                    `ð¤ ${grupoId}: ${quantidadeGrupo} mensagens recuperadas.`
                );

            } catch (erroGrupo) {

                console.error(
                    `â ï¸ Erro ao processar XP do grupo ${grupoId}:`,
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
            `ð¤ XP OFFLINE CONCLUÃDO: ${totalMensagens} mensagens = +${totalXP} XP`
        );

    } catch (erro) {

        console.error(
            'â Erro geral ao processar XP offline:',
            erro
        );
    }
}


// ============================================================
// â±ï¸ ATUALIZAR CONTROLE DO XP ENQUANTO O BOT ESTÃ ONLINE
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
            'â ï¸ Erro ao atualizar controle de XP online:',
            erro
        );
    }
}


// ============================================================
// ð¾ SALVAR CONTROLE PERIODICAMENTE
// ============================================================

setInterval(
    () => {

        salvarControleXP();

    },
    60000
);

// ============================================================
// ð SALVAR PIADAS
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
            'ð¾ Piadas salvas!'
        );

    } catch (erro) {

        console.log(
            'â Erro ao salvar piadas:',
            erro.message
        );
    }
}

// ============================================================
// CONEXÃO
// ============================================================

client.on('qr', qr => {
    console.log('\nEscaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on(
    'ready',
    async () => {

        console.log(
            'â BOT CONECTADO!'
        );

        await processarXPOffline();

        

    }
);

client.on('auth_failure', mensagem => {

    console.error(
        'â Falha na autenticaÃ§Ã£o:',
        mensagem
    );

});


client.on('disconnected', motivo => {

    console.log(
        'â ï¸ Bot desconectado:',
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

function aplicarEstiloMensagem(conteudo) {
    if (conteudo === null || conteudo === undefined) {
        return conteudo;
    }

    const texto = String(conteudo);

    // Mensagens que jÃ¡ usam o layout do bot permanecem exatamente como estÃ£o.
    if (texto.includes('âââ¢â') || texto.includes('âââ¢â')) {
        return texto;
    }

    const linhas = texto.split('\n');
    return `âââ¢âà¼ºð¬à¼»ââ¢ââ\nâ\n${linhas.map(linha => `ââ¤ ${linha}`).join('\n')}\nâ\nâââ¢âà¼ºð¬à¼»ââ¢ââ`;
}

async function responderCitando(message, conteudo, opcoes = {}) {
    try {
        const idMensagem = obterIdMensagem(message);

        const configuracao = {
            ...opcoes
        };

        if (idMensagem) {
            configuracao.quotedMessageId = idMensagem;
        }

        const conteudoFinal = aplicarEstiloMensagem(
            aplicarPersonalidade(
                conteudo,
                message.from
            )
        );

        return await enviarComMencoes(
            message.from,
            conteudoFinal,
            configuracao
        );

    } catch (erro) {
        console.error('â ERRO AO ENVIAR MENSAGEM:', erro);
        throw erro;
    }
}


// ============================================================
// REAÃÃES
// ============================================================

async function reagir(message, emoji) {
    try {
        await message.react(emoji);
    } catch (erro) {
        console.log(
            'â ï¸ NÃ£o foi possÃ­vel reagir:',
            erro.message
        );
    }
}


// ============================================================
// MENÃÃES
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
                        console.log('â ï¸ NÃ£o foi possÃ­vel obter o contato da mensagem citada:', erroContato.message);
                    }
                }

                return { id: { _serialized: idAutor } };
            } catch (erroResposta) {
                console.log('â ï¸ Erro ao obter pessoa pela resposta:', erroResposta.message);
            }
        }

        return null;
    } catch (erro) {
        console.log('â ï¸ Erro ao obter menÃ§Ã£o/resposta:', erro.message);
        return null;
    }
}

function nomeDaPessoa(contato) {
    if (!contato) {
        return 'alguÃ©m';
    }

    return (
        contato.pushname ||
        contato.name ||
        contato.shortName ||
        contato.number ||
        'alguÃ©m'
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
        return '@alguÃ©m';
    }

    // IMPORTANTE: o texto precisa usar exatamente o mesmo identificador
    // que vai em `mentions`. Isso Ã© especialmente importante para LIDs.
    return `@${id.split('@')[0]}`;
}

// ============================================================
// MENÃÃES
// ============================================================
// Mantemos exatamente o ID fornecido pelo WhatsApp.
// NÃ£o convertemos LID -> @c.us aqui: o PPP e os comandos de casamento
// que jÃ¡ funcionam usam o ID original do participante/contato, e o
// texto da menÃ§Ã£o usa o mesmo prefixo. Alterar esse ID no envio pode
// fazer o WhatsApp renderizar apenas um @123... sem transformar em menÃ§Ã£o.

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
            // que estÃ¡ sendo enviado na propriedade `mentions`.
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
        aplicarEstiloMensagem(conteudo),
        {
            ...configuracao,
            quotedMessageId: obterIdMensagem(message)
        }
    );
}

// O ID usado pelos outros sistemas continua sendo o ID interno original.
// A conversÃ£o para menÃ§Ã£o real acontece somente no momento do envio.
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
        await reagir(message, 'â');

        await responderCitando(
            message,
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ððððÌ§ðÌð ððÌð ðððððððððð*
â
ââ¤ _Mencione alguÃ©m ou responda Ã  mensagem dela._
â
ââ¤ *ððððððð:*
â   *${PREFIXO}tapa @pessoa*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
        );

        return null;
    }

    return pessoa;
}


// ============================================================
// PERMISSÃES DE ADMIN
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

    // Nunca consideramos um LID igual a um telefone sÃ³ porque
    // ambos tÃªm nÃºmeros antes do @. LIDs e JIDs podem ter valores
    // numÃ©ricos completamente diferentes.
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
                'â ï¸ NÃ£o foi possÃ­vel obter LID:',
                erro.message
            );
        }
    }

    return ids;
}

// ============================================================
// VERIFICAR SE O BOT Ã ADMIN
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
        // OBTER IDS POSSÃVEIS DO BOT
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

        // Tentar obter nÃºmero/LID relacionados ao bot
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
                'â ï¸ NÃ£o foi possÃ­vel obter LID do bot:',
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
                                    'ColeÃ§Ã£o Chat nÃ£o disponÃ­vel.'
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
                                    'Grupo nÃ£o encontrado.'
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
                                    'Participantes do grupo nÃ£o disponÃ­veis.'
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
                'â ï¸ NÃ£o foi possÃ­vel obter participantes:',
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
                    // o prÃ³prio WhatsApp marcou este participante
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
                'â ï¸ Bot nÃ£o foi encontrado nos participantes do grupo.'
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
            'ð¤ Bot encontrado:',
            participanteBot.id
        );

        console.log(
            'ð Bot Ã© admin:',
            botAdmin
        );

        return botAdmin;

    } catch (erro) {
        console.error(
            'â Erro ao verificar se o bot Ã© admin:',
            erro
        );

        return false;
    }
}

// ============================================================
// VERIFICAR ADMIN DO USUÃRIO
// ============================================================

function ehAdminDoGrupo(message, chat) {

    try {

        if (!chat || !chat.isGroup) {
            return false;
        }

        const idRemetente =
            obterIdRemetente(message);



// ============================================================
// ð¥ REGISTRAR PARTICIPANTE DO GRUPO
// ============================================================

console.log('ð¥ TESTE PARTICIPANTE');
console.log('ð CHAT:', message.from);
console.log('ð¤ REMETENTE:', idRemetente);

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
            'â ï¸ Erro ao verificar admin:',
            erro.message
        );

        return false;
    }
}



// ============================================================
// EXIGIR ADMIN
// ============================================================

console.log('ð¥ EXIGIR ADMIN NOVA VERSÃO');

async function exigirAdmin(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE Ã GRUPO
        // ========================================================

        if (!chatId || !chatId.endsWith('@g.us')) {

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ððððððð ðð ððððð*
â
ââ¤ _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
                'â ï¸ Erro ao obter LID do bot:',
                erroLid?.message || erroLid
            );
        }

        // Garantir nÃºmero normal
        if (!botIds.includes(`${botNumero}@c.us`)) {

            botIds.push(
                `${botNumero}@c.us`
            );
        }

        console.log(
            'ð¥ IDS DO BOT OBTIDOS:',
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
                'â Erro ao obter dados do grupo:',
                dadosChat?.erro
            );

            await reagir(message, 'â');

            await responderCitando(
                message,
                'â _NÃ£o foi possÃ­vel verificar as permissÃµes do grupo._'
            );

            return false;
        }

        // ========================================================
        // VERIFICAR ADMIN DO USUÃRIO
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
        // USUÃRIO NÃO Ã ADMIN
        // ========================================================

        if (!usuarioAdmin) {

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððððð ðððððð*
â
ââ¤ _VocÃª precisa ser administrador_
â   _para usar esse comando._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
            );

            return false;
        }

        // ========================================================
        // VERIFICAR SE O BOT Ã ADMIN
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
            'BOT Ã ADMIN:',
            botAdmin
        );

        // ========================================================
        // BOT NÃO Ã ADMIN
        // ========================================================

        if (!botAdmin) {

            console.log(
                'â ï¸ Bot nÃ£o encontrado como administrador.'
            );

            await reagir(message, 'â ï¸');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ððð NÃO Ã ADMIN*
â
ââ¤ _Eu preciso ser administrador_
â   _do grupo para fazer isso._
â
ââ¤ _Promova o JUST BOT e tente novamente._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
            );

            return false;
        }

        // ========================================================
        // TUDO CERTO
        // ========================================================

        console.log(
            'â USUÃRIO E BOT SÃO ADMINISTRADORES!'
        );

        return true;

    } catch (erro) {

        console.error(
            'â Erro ao verificar permissÃµes:',
            erro
        );

        await reagir(message, 'â');

        await responderCitando(
            message,
            'â _NÃ£o foi possÃ­vel verificar as permissÃµes do grupo._'
        );

        return false;
    }
}

// ============================================================
// ð  MENU PRINCIPAL
// ============================================================

async function menuPrincipal(message) {

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â     *ðððð ððð*
â       *ð${VERSAO}*
ââ¯
â
â  ð *ððððððððððððððð*
â  _Casamentos, famÃ­lia e romance_
â
â  ð *ðððððððÌð*
â  _Piadas e diversÃ£o_
â
â  ð® *ððððð*
â  _Jogos e desafios_
â
â  âï¸ *ððð*
â  _AÃ§Ãµes, combate e aventura_
â
â  ð¼ï¸ *ððÌððð*
â  _Figurinhas, emojis e mÃºsica_
â
â  ð¡ï¸ *ðððððððÌ§ðÌð*
â  _Ferramentas para administradores_
â
â  ð *ðððð*
â  _ServiÃ§os e informaÃ§Ãµes online_
â
â  âï¸ *ðððððððððð*
â  _Ferramentas gerais_
â
â  ð¤ *ððð*
â  _InformaÃ§Ãµes e comandos do bot_
â
ââ¯
â
â  ð¡ *ðððð ðððð*
â  _Digite o comando da categoria_
â  _para abrir seu menu._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ

*ððððððð:*
*${PREFIXO}jogos* ð®

*ðððððÌð ${VERSAO}*`
    );
}

// ============================================================
// ð MENUS DE CATEGORIAS
// ============================================================

// ============================================================
// ð MENU RELACIONAMENTOS
// ============================================================

async function menuRelacionamentos(message) {

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â  *ð ððððððððððððððð*
ââ¯
â
ââ¤ ð *${PREFIXO}casar @pessoa*
â   _Fazer uma proposta de casamento_
â
ââ¤ ð *${PREFIXO}divorcio*
â   _Solicitar um divÃ³rcio_
â
ââ¤ ð¶ *${PREFIXO}adotar @pessoa*
â   _Fazer uma proposta de adoÃ§Ã£o_
â
ââ¤ ð¨âð©âð§ *${PREFIXO}familia*
â   _Ver sua famÃ­lia_
â
ââ¤ ð *${PREFIXO}casal*
â   _Formar um casal aleatÃ³rio_
â
ââ¤ ð *${PREFIXO}shipar @pessoa @pessoa*
â   _Calcular compatibilidade_
â
ââ¤ ð *${PREFIXO}cantada*
â   _Receber uma cantada_
â
ââ¯
â
â  ð© *ððððððððð*
â
ââ¤ ð *${PREFIXO}aceitar*
â   _Aceitar uma proposta_
â
ââ¤ ð *${PREFIXO}recusar*
â   _Recusar uma proposta_
â
âââ¢âà¼ºðà¼»ââ¢ââ`
    );
}


// ============================================================
// ð MENU DIVERSÃO
// ============================================================

async function menuDiversao(message) {

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â      *ðððððððÌð*
â
ââ¯
â
â  ð *ðððððð*
â
â  *${PREFIXO}piadas*
â  _Receba uma piada aleatÃ³ria._
â
â  *${PREFIXO}addpiada*
â  _Adicione uma piada personalizada._
â
â  *${PREFIXO}listapiadas*
â  _Veja todas as piadas cadastradas._
â
â  *${PREFIXO}removerpiada*
â  _Remova uma piada pelo nÃºmero._
â
â  *${PREFIXO}limparpiadas*
â  _Apague todas as piadas._
â
â  *${PREFIXO}carregarpiadas*
â  _Importe piadas atravÃ©s de um .txt._
â
ââ¯
â  ð *ðððð*
â
â  *${PREFIXO}piada*
â  _Buscar uma piada em API pÃºblica._
â
â  *${PREFIXO}anime <nome>*
â  _Consultar informaÃ§Ãµes de um anime._
â
ââ¯
â  ð *ððððððð*
â
â  *${PREFIXO}cantada*
â  _Receba uma cantada aleatÃ³ria._
â
â  â ï¸ *${PREFIXO}suicidio*
â  _Comando de humor do bot._
â
ââ¯
â  ð² *ððððð ðððððððÌðð*
â
â  *${PREFIXO}verdade*
â  _Receber uma pergunta de verdade._
â
â  *${PREFIXO}desafio*
â  _Receber um desafio._
â
â  *${PREFIXO}vidente pergunta*
â  _Consultar o futuro._
â
â  *${PREFIXO}8ball pergunta*
â  _Perguntar Ã  Magic 8 Ball._
â
â  *${PREFIXO}decidir opÃ§Ã£o 1 ou opÃ§Ã£o 2*
â  _Deixar o bot decidir._
â
â  *${PREFIXO}crush @pessoa*
â  _Medir o crush._
â
â  *${PREFIXO}amizade @pessoa*
â  _Medir a amizade._
â
â  *${PREFIXO}inimigos @pessoa*
â  _Medir a rivalidade._
â
â  *${PREFIXO}fbi @pessoa*
â  _Gerar um relatÃ³rio fictÃ­cio do FBI._
â
â  *${PREFIXO}laudo @pessoa*
â  _Gerar um laudo completamente fictÃ­cio._
â
â  *${PREFIXO}curriculo @pessoa*
â  _Gerar um currÃ­culo aleatÃ³rio._
â
â  *${PREFIXO}nota @pessoa*
â  _Dar uma nota aleatÃ³ria._
â
ââ¯
â
â  ð¡ Para voltar ao menu:
â  *${PREFIXO}menu*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
    );
}


// ============================================================
// âï¸ MENU RPG
// ============================================================

async function menuRPG(message) {

    await reagir(
        message,
        'âï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â        *âï¸ ððð*
ââ¯
â
â  âï¸ *ððððððð*
â
ââ¤ ð *${PREFIXO}tapa @pessoa*
ââ¤ ð *${PREFIXO}soco @pessoa*
ââ¤ ð¦µ *${PREFIXO}chute @pessoa*
ââ¤ ð¨ *${PREFIXO}empurrar @pessoa*
ââ¤ âï¸ *${PREFIXO}duelo @pessoa*
ââ¤ ð° *${PREFIXO}roubar @pessoa*
â
ââ¯
â
â  â¤ï¸ *ðððððððÌ§ðÌðð*
â
ââ¤ ð¤ *${PREFIXO}abracar @pessoa*
ââ¤ ð¡ï¸ *${PREFIXO}proteger @pessoa*
ââ¤ ð *${PREFIXO}curar @pessoa*
ââ¤ â­ *${PREFIXO}elogiar @pessoa*
ââ¤ ð *${PREFIXO}zoar @pessoa*
â
ââ¯
â
â  ðºï¸ *ðððððððð*
â
ââ¤ ðºï¸ *${PREFIXO}aventura*
â   _Parta para uma aventura_
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ

_â ï¸ Todas as aÃ§Ãµes sÃ£o fictÃ­cias._`
    );
}


// ============================================================
// ð¼ï¸ MENU MÃDIA
// ============================================================

async function menuMidia(message) {

    await reagir(
        message,
        'ð¼ï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºð¼ï¸à¼»ââ¢ââ
â       *ð¼ï¸ ððÌððð*
ââ¯
â
ââ¤ ð¼ï¸ *${PREFIXO}fig*
â   _Transformar imagem em figurinha_
â
ââ¤ ð¼ï¸ *${PREFIXO}figurinha*
â   _Criar uma figurinha_
â
ââ¤ ð *${PREFIXO}emojimix ð ð*
â   _Combinar dois emojis_
â
ââ¤ ð¤ *${PREFIXO}brat1 texto*
â   _Criar figurinha Brat_
â
ââ¤ ð¤ *${PREFIXO}brat2 texto*
â   _Criar Brat animado_
â
ââ¤ ðµ *${PREFIXO}playm mÃºsica*
â   _Buscar mÃºsica e prÃ©via_
â
ââ¤ ð£ï¸ *${PREFIXO}tts texto*
â   _Transformar texto em voz_
â
ââ¤ ðï¸ *ððððððð ðð ððð*
â
ââ¤ ð¿ï¸ *${PREFIXO}esquilo*
â   _Voz de esquilo_
ââ¤ ð¿ï¸ *${PREFIXO}chipmunk*
â   _Voz ainda mais aguda_
ââ¤ ð *${PREFIXO}agudo*
â   _Deixar a voz mais aguda_
ââ¤ ð¹ *${PREFIXO}demonio*
â   _Voz demonÃ­aca_
ââ¤ ð¿ *${PREFIXO}grave*
â   _Deixar a voz mais grave_
ââ¤ ð¤ *${PREFIXO}robo*
â   _Efeito de voz robÃ³tica_
ââ¤ ð» *${PREFIXO}radio*
â   _Efeito de rÃ¡dio_
ââ¤ âï¸ *${PREFIXO}telefone*
â   _Efeito de telefone_
ââ¤ ð¢ *${PREFIXO}megafone*
â   _Efeito de megafone_
ââ¤ ðï¸ *${PREFIXO}eco*
â   _Adicionar eco_
ââ¤ ð³ï¸ *${PREFIXO}cavern*
â   _Efeito de caverna_
ââ¤ ð½ *${PREFIXO}alien*
â   _Voz alienÃ­gena_
ââ¤ ð¥ *${PREFIXO}distorcido*
â   _Distorcer a voz_
ââ¤ ð *${PREFIXO}reverso*
â   _Reproduzir o Ã¡udio ao contrÃ¡rio_
â
ââ¤ ð _Os efeitos podem ser aplicados_
â   _respondendo a um Ã¡udio._
â
ââ¯
â
â  ðï¸ _Algumas mÃ­dias podem ser_
â  _enviadas como visualizaÃ§Ã£o Ãºnica._
â
âââ¢âà¼ºð¼ï¸à¼»ââ¢ââ`
    );
}


// ============================================================
// ð¡ï¸ MENU MODERAÃÃO
// ============================================================

async function menuModeracao(message) {

    await reagir(
        message,
        'ð¡ï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ
â    *ð¡ï¸ ðððððððÌ§ðÌð*
ââ¯
â
ââ¤ ð¨ *${PREFIXO}ban @pessoa*
â   _Expulsar uma pessoa_
â   _TambÃ©m funciona respondendo Ã  mensagem_
â
ââ¤ ð *${PREFIXO}mute @pessoa*
â   _Silenciar uma pessoa_
â
ââ¤ ð *${PREFIXO}unmute @pessoa*
â   _Remover o mute_
â
ââ¤ ð« *${PREFIXO}muteblacklist nÃºmero*
â   _Adicionar Ã  blacklist_
â
ââ¤ â *${PREFIXO}unmuteblacklist nÃºmero*
â   _Remover da blacklist_
â
â ð *AVISOS AUTOMÃTICOS*
â
â ð ;aviso HH:MM / mensagem
â    Cria um aviso diÃ¡rio.
â
â ðï¸ ;rem_aviso HH:MM
â    Remove um aviso.
â
â ð ;listaviso
â    Lista os avisos do grupo.
â
ââ¤ ð *${PREFIXO}soadm*
â   _Alternar modo somente administradores_
â
ââ¤ ð *${PREFIXO}gp f*
â   _Somente admins podem enviar mensagens_
â
ââ¤ ð *${PREFIXO}gp a*
â   _Todos podem enviar mensagens_
â
ââ¯
â
â  âï¸ *ððððððððððÌ§ðÌð*
â
ââ¤ âï¸ *${PREFIXO}config*
â   _Painel de configuraÃ§Ãµes do grupo_
ââ¤ ð *${PREFIXO}antilink on/off*
â   _Bloquear links nÃ£o permitidos_
ââ¤ ð¨ *${PREFIXO}antiflood on/off*
â   _Controlar flood de mensagens_
ââ¤ ð *${PREFIXO}welcome on/off*
ââ¤ ðª *${PREFIXO}goodbye on/off*
ââ¤ ð *${PREFIXO}setwelcome texto*
ââ¤ ð *${PREFIXO}setgoodbye texto*
ââ¤ ð® *${PREFIXO}jogos on/off*
ââ¤ ð° *${PREFIXO}economia on/off*
ââ¤ â­ *${PREFIXO}xp on/off*
ââ¤ ð *${PREFIXO}cmds on/off*
ââ¤ ð£ *${PREFIXO}prefixo !*
â
â  ð·ï¸ *ððððð*
â
ââ¤ âï¸ *${PREFIXO}setnome Novo nome*
ââ¤ ð¼ï¸ *${PREFIXO}setfoto* _respondendo uma imagem_
ââ¤ ð *${PREFIXO}desc*
ââ¤ ð *${PREFIXO}setdesc Nova descriÃ§Ã£o*
ââ¤ ð *${PREFIXO}setregras regras*
ââ¤ ð *${PREFIXO}regras*
ââ¤ ð *${PREFIXO}staff*
â
â  ð *ððððððð*
â
ââ¤ ð *${PREFIXO}sorteio 10m prÃªmio*
ââ¤ ðï¸ *${PREFIXO}sorteio2 10m prÃªmio 2*\nââ¤ ðª *${PREFIXO}sorteiogold 10m prÃªmio*\nââ¤ ð *${PREFIXO}cancelarsorteio*
ââ¤ ð§¹ *${PREFIXO}limpar 10*
ââ¤ ð¤ *${PREFIXO}add_parceria nome | contato/link*\nââ¤ ð¤ *${PREFIXO}del_parceria ID*\nââ¤ ð¤ *${PREFIXO}parceria*\nââ¤ ð¤ *${PREFIXO}modoparceria on/off*\nâ\nâ  â ï¸ *ðððððððÌððððð*\nâ\nââ¤ *${PREFIXO}adverter @pessoa motivo*\nââ¤ *${PREFIXO}rm_adv @pessoa [quantidade]*\nââ¤ *${PREFIXO}lista_adv*\nââ¤ *${PREFIXO}ver_adv @pessoa*\nââ¤ *${PREFIXO}limpar_adv*\nâ\nâ  ð *ððððððÌ§ðÌðð*\nâ\nââ¤ *${PREFIXO}anotar tÃ­tulo | texto*\nââ¤ *${PREFIXO}anotaÃ§Ãµes*\nââ¤ *${PREFIXO}rmnota ID*\nâ\nâ  ð *ðððððð*\nâ\nââ¤ *${PREFIXO}listabranca @pessoa*\nââ¤ *${PREFIXO}rmlistabranca @pessoa*\nââ¤ *${PREFIXO}listanegra*\nââ¤ *${PREFIXO}tirardalista @pessoa*\nââ¤ *${PREFIXO}add_palavra palavra*\nââ¤ *${PREFIXO}rm_palavra palavra*\nââ¤ *${PREFIXO}lista_palavras*\nââ¤ ð *${PREFIXO}logs on/off*
â
â  â­ *ððððððððÌ§ðÌð*
â
ââ¤ â­ *${PREFIXO}darxp @pessoa 100*
ââ¤ â­ *${PREFIXO}removerxp @pessoa 100*
ââ¤ â»ï¸ *${PREFIXO}resetxp @pessoa*
ââ¤ ð° *${PREFIXO}darcoins @pessoa 100*
ââ¤ ð° *${PREFIXO}removercoins @pessoa 100*
ââ¤ â»ï¸ *${PREFIXO}reseteco @pessoa*\nââ¤ ð¤ *${PREFIXO}anagrama palavra*
â
ââ¯
â
â  ð _O bot precisa ser_
â  _administrador do grupo._
â
âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ`
    );
}


// ============================================================
// ð MENU APIS
// ============================================================

async function menuAPIs(message) {
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ        *ð ðððð*\nââ¯\nâ\nââ¤ ðµ *${PREFIXO}shazam*\nâ   _Identificar uma mÃºsica a partir de um Ã¡udio._\nâ\nââ¤ ð± *${PREFIXO}qr <texto/link>*\nâ   _Gerar um QR Code._\nâ\nââ¤ â½ *${PREFIXO}futebol*\nâ   _Ver jogos de futebol de hoje._\nâ\nââ¤ ð´ *${PREFIXO}futebol ao vivo*\nâ   _Ver partidas ao vivo._\nâ\nââ¤ ðï¸ *${PREFIXO}f1*\nâ   _Ver a prÃ³xima corrida._\nâ\nââ¤ ð *${PREFIXO}f1 calendario*\nâ   _Ver o calendÃ¡rio da temporada._\nâ\nââ¤ ð *${PREFIXO}f1 classificacao*\nâ   _Ver a classificaÃ§Ã£o de pilotos._\nâ\nââ¤ ð«ï¸ *${PREFIXO}ar <cidade>*\nâ   _Consultar a qualidade do ar._\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

// ============================================================
// âï¸ MENU UTILIDADES
// ============================================================

async function menuUtil(message) {

    await reagir(
        message,
        'âï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â     *âï¸ ðððððððððð*
ââ¯
â
ââ¤ ð *${PREFIXO}ping*
â   _Verificar se o bot estÃ¡ online_
â
ââ¤ ð *${PREFIXO}hora*
â   _Mostrar a hora atual_
â
ââ¤ ð¤ *${PREFIXO}info*
â   _Mostrar informaÃ§Ãµes_
â
ââ¤ ð¦ï¸ *${PREFIXO}clima <cidade>*
â   _Consultar o clima atual_
â
ââ¤ â±ï¸ *${PREFIXO}uptime*
â   _Ver hÃ¡ quanto tempo o bot estÃ¡ online_
ââ¤ ð *${PREFIXO}status*
â   _Ver o status tÃ©cnico do bot_
ââ¤ ð¼ï¸ *${PREFIXO}avatar @pessoa*
â   _Ver a foto de perfil_
ââ¤ ð *${PREFIXO}admins*
â   _Listar os administradores do grupo_
ââ¤ ð *${PREFIXO}id*
â   _Ver seu ID_
ââ¤ ð¯ *${PREFIXO}escolher opÃ§Ã£o 1 | opÃ§Ã£o 2*
â   _Escolher uma opÃ§Ã£o aleatoriamente_
ââ¤ â³ *${PREFIXO}contador 10*
â   _Fazer uma contagem regressiva_
ââ¤ â±ï¸ *${PREFIXO}cronometro 30s*
â   _Criar um cronÃ´metro_
ââ¤ ð§® *${PREFIXO}calculadora 2 + 2*
â   _Fazer cÃ¡lculos_
ââ¤ ð *${PREFIXO}porcentagem 20 de 500*
â   _Calcular porcentagens_
ââ¤ ð *${PREFIXO}regra3 2 10 5*
â   _Resolver regra de trÃªs_
ââ¤ ð *${PREFIXO}converter 10 km mi*
â   _Converter unidades_
ââ¤ ð± *${PREFIXO}cotacao USD BRL 100*
â   _Consultar cotaÃ§Ã£o de moedas_
ââ¤ ð *${PREFIXO}traduzir en pt texto*
â   _Traduzir um texto_
ââ¤ ð *${PREFIXO}encurtar https://...*
â   _Encurtar um link_
ââ¤ â­ *${PREFIXO}level*
â   _Ver seu nÃ­vel de XP_
ââ¤ ð *${PREFIXO}rank*
â   _Ver o ranking de XP_
ââ¤ ð *${PREFIXO}ranklindo / rankfeio*
â   _Ranks de aparÃªncia_
ââ¤ ð *${PREFIXO}rankgay / rankhetero / ranklesbico*
â   _Ranks variados_
ââ¤ ð§  *${PREFIXO}rankinteligente*
â   _Rank de inteligÃªncia_
ââ¤ ðª *${PREFIXO}rankpobre*
â   _Rank baseado nas moedas_
ââ¤ ð¨ *${PREFIXO}csrank <critÃ©rio>*
â   _Rank personalizado_
ââ¤ ð *${PREFIXO}rankship @pessoa @pessoa*
â   _Rank de compatibilidade_
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`
    );
}


// ============================================================
// ð¤ MENU DO BOT
// ============================================================

async function menuBot(message) {

    await reagir(
        message,
        'ð¤'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºð¤à¼»ââ¢ââ
â       *ð¤ ðððð ððð*
ââ¯
â
ââ¤ ð *${PREFIXO}menu*
â   _Abrir o menu principal_
â
ââ¤ ð *${PREFIXO}comandos*
â   _Ver todos os comandos_
â
ââ¤ ð *${PREFIXO}changelog*
â   _Ver novidades e alteraÃ§Ãµes_
â
ââ¤ â¹ï¸ *${PREFIXO}sobre*
â   _InformaÃ§Ãµes sobre o bot_
â
ââ¤ ð *${PREFIXO}ping*
â   _Verificar status_
â
ââ¤ âï¸ *${PREFIXO}info*
â   _InformaÃ§Ãµes do sistema_
â
ââ¤ ð­ *${PREFIXO}personalidades*
â   _Ver as personalidades disponÃ­veis_
â
ââ¤ âï¸ *${PREFIXO}personalidade <nome>*
â   _Alterar a personalidade do grupo_
â
ââ¯
â
â  ð¤ *ðððððð*
â
ââ¤ ð¢ _Online_
ââ¤ ð¢ _VersÃ£o ${VERSAO}_
â
âââ¢âà¼ºð¤à¼»ââ¢ââ`
    );
}

// ============================================================
// ð CHANGELOG
// ============================================================

async function changelog(message) {

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â        *ðððð ððð*
â       *ððððððððð*
â
ââ¯
â
â  ð *ðððððÌð ð.ðð*
â
â  ðï¸ *ððð ð ððððððð ðð ððð*
â
â  ââ¤ *${PREFIXO}tts texto*
â  â   Converte texto em mensagem de voz.
â  â
â  ââ¤ *${PREFIXO}esquilo*
â  ââ¤ *${PREFIXO}chipmunk*
â  ââ¤ *${PREFIXO}agudo*
â  ââ¤ *${PREFIXO}demonio*
â  ââ¤ *${PREFIXO}grave*
â  ââ¤ *${PREFIXO}robo*
â  ââ¤ *${PREFIXO}radio*
â  ââ¤ *${PREFIXO}telefone*
â  ââ¤ *${PREFIXO}megafone*
â  ââ¤ *${PREFIXO}eco*
â  ââ¤ *${PREFIXO}cavern*
â  ââ¤ *${PREFIXO}alien*
â  ââ¤ *${PREFIXO}distorcido*
â  ââ¤ *${PREFIXO}reverso*
â      Novos efeitos para modificar Ã¡udios.
â
â  ð *ððððððð ððð ðððððððð*
â
â  ââ¤ Efeitos podem ser aplicados respondendo
â  â   diretamente a um Ã¡udio.
â  ââ¤ Ãudios enviados pelo prÃ³prio bot tambÃ©m
â      possuem suporte de processamento.
â
ââ¯
â
â  ð *ðððððÌð ð.ðð*
â
â  ð *ððððððððÌ§ðÌð ððð ðððð*
â
â  ââ¤ *${PREFIXO}pokemon <nome>*
â  â   Consulta dados de PokÃ©mon.
â  â
â  ââ¤ *${PREFIXO}piada*
â  â   Busca uma piada em API pÃºblica.
â  â
â  ââ¤ *${PREFIXO}anime <nome>*
â  â   Consulta informaÃ§Ãµes de anime.
â  â
â  ââ¤ *${PREFIXO}quiz*
â  â   Agora usa perguntas aleatÃ³rias da Open Trivia DB.
â  â
â  ââ¤ *${PREFIXO}clima <cidade>*
â      Consulta o clima atual.
â
â  ð *ððððð ðððð*
â
â  ââ¤ *${PREFIXO}shazam*
â  â   Identifica mÃºsicas enviadas como Ã¡udio.
â  â
â  ââ¤ *${PREFIXO}qr <texto/link>*
â  â   Gera QR Codes.
â  â
â  ââ¤ *${PREFIXO}futebol*
â  â   Consulta jogos de futebol.
â  â
â  ââ¤ *${PREFIXO}f1*
â  â   Consulta calendÃ¡rio e classificaÃ§Ã£o da F1.
â  â
â  ââ¤ *${PREFIXO}ar <cidade>*
â      Consulta a qualidade do ar.
â
â  ð *ðððð ððððððð ððð*
â
â  ââ¤ *${PREFIXO}soadm*
â  â   Alterna o grupo entre modo normal
â  â   e modo em que apenas administradores
â  â   podem usar os comandos.
â  â
â  ð¡ï¸ *ðððððððÌ§ðÌð E ALVOS POR RESPOSTA*
â
â  ââ¤ *${PREFIXO}ban @pessoa*
â  â   Expulsa participantes do grupo.
â  â
â  ââ¤ *${PREFIXO}ban* em resposta
â  â   Identifica o alvo pela mensagem respondida.
â  â
â  ââ¤ Comandos de alvo agora aceitam resposta
â      alÃ©m de menÃ§Ãµes quando aplicÃ¡vel.
â
â  ð° *ððððððððð ðð ðððððððð*
â
â  ââ¤ Identidade LID/JID e carteiras reforÃ§adas.
â  ââ¤ Cooldowns de mineraÃ§Ã£o e roubo persistem apÃ³s reinÃ­cio.
â  ââ¤ Apostas, doaÃ§Ãµes e sorteios recebem validaÃ§Ã£o rÃ­gida.
â  ââ¤ HistÃ³rico dos slots ficou mais completo.
â  ââ¤ Rankings nÃ£o criam carteiras novas.
â
â  ð *ððððððð ðð ðððððð*
â
â  ââ¤ *${PREFIXO}addpiada*
â  â   Adiciona piadas personalizadas.
â  â
â  ââ¤ *${PREFIXO}listapiadas*
â  â   Lista todas as piadas cadastradas.
â  â
â  ââ¤ *${PREFIXO}removerpiada*
â  â   Remove uma piada pelo nÃºmero.
â  â
â  ââ¤ *${PREFIXO}limparpiadas*
â  â   Remove todas as piadas com confirmaÃ§Ã£o.
â  â
â  ââ¤ *${PREFIXO}carregarpiadas*
â      Importa vÃ¡rias piadas atravÃ©s
â      de um arquivo *.txt*.
â
â  ð¾ As piadas agora sÃ£o salvas
â     automaticamente e permanecem
â     apÃ³s reiniciar o bot.
â
ââ¯
â
â  ð *ðððð ððððððððððð*
â
â  O sistema de menus foi reorganizado
â  em categorias para facilitar o uso.
â
ââ¯
â
â  ð *ðððððÌð ð.ð*
â
â  ââ¤ Novo sistema de menus
â  ââ¤ Menus separados por categoria
â  ââ¤ Novo menu principal
â
â  ð *ðððððÌð ð.ð*
â
â  ââ¤ Sistema de relacionamentos
â  ââ¤ Casamentos e divÃ³rcios
â  ââ¤ Sistema de famÃ­lia
â  ââ¤ AdoÃ§Ã£o
â  ââ¤ Diversos comandos novos
â
â  ð *ðððððÌð ð.ð*
â
â  ââ¤ AtualizaÃ§Ã£o do sistema
â      de figurinhas Brat
â
âââ¢âà¼ºðà¼»ââ¢ââ

*ðððððÌð ððððð: ð.ðð*`
    );
}

// ============================================================
// ð LISTA COMPLETA DE COMANDOS
// ============================================================

async function listarComandos(message) {

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â       *ðððð ððð*
â   *ððððð ðððððððð*
â
ââ¯
â
â  ð *ððððððððððððððð*
â
ââ¤ ð *${PREFIXO}casar @pessoa*
â   _Fazer uma proposta de casamento_
â
ââ¤ ð *${PREFIXO}aceitar*
â   _Aceitar uma proposta_
â
ââ¤ ð *${PREFIXO}recusar*
â   _Recusar uma proposta_
â
ââ¤ ð *${PREFIXO}divorcio*
â   _Solicitar divÃ³rcio_
â
ââ¤ ð¶ *${PREFIXO}adotar @pessoa*
â   _Propor uma adoÃ§Ã£o_
â
ââ¤ ð¨âð©âð§ *${PREFIXO}familia*
â   _Ver sua famÃ­lia_
â
ââ¤ ð *${PREFIXO}casal*
â   _Formar um casal aleatÃ³rio_
â
ââ¤ ð *${PREFIXO}shipar @pessoa @pessoa*
â   _Calcular compatibilidade_
â
ââ¯
â
â  ð *ðððððððÌð*
â
ââ¤ ð *${PREFIXO}piadas*
â   _Receber uma piada_
â
ââ¤ â *${PREFIXO}addpiada texto*
â   _Adicionar uma piada_
â
ââ¤ ð *${PREFIXO}listapiadas*
â   _Listar as piadas_
â
ââ¤ ðï¸ *${PREFIXO}removerpiada nÃºmero*
â   _Remover uma piada_
â
ââ¤ ð§¹ *${PREFIXO}limparpiadas*
â   _Limpar todas as piadas_
â
ââ¤ ð *${PREFIXO}carregarpiadas*
â   _Recarregar as piadas_
â
ââ¤ ð *${PREFIXO}cantada*
â   _Receber uma cantada_
â
ââ¤ ð *${PREFIXO}piada*
â   _Buscar uma piada em API pÃºblica_
â
ââ¤ ð¥ *${PREFIXO}anime <nome>*
â   _Consultar informaÃ§Ãµes de um anime_
â
ââ¤ ðµ *${PREFIXO}shazam*
â   _Identificar uma mÃºsica a partir de um Ã¡udio_
â
ââ¤ ð± *${PREFIXO}qr <texto/link>*
â   _Gerar um QR Code_
â
ââ¤ â½ *${PREFIXO}futebol*
â   _Ver jogos de futebol de hoje_
â
ââ¤ ðï¸ *${PREFIXO}f1*
â   _Ver a prÃ³xima corrida de F1_
â
ââ¤ ð«ï¸ *${PREFIXO}ar <cidade>*
â   _Consultar a qualidade do ar_
â
ââ¤ â ï¸ *${PREFIXO}suicidio*
â   _Comando de humor_
â
ââ¯
â
â  ð® *ððððð*
â
ââ¤ ð² *${PREFIXO}dado*
â   _Rolar um dado_
â
ââ¤ ðª *${PREFIXO}moeda*
â   _Cara ou coroa_
â
ââ¤ ð® *${PREFIXO}sn pergunta*
â   _Responder sim ou nÃ£o_
â
ââ¤ âï¸ *${PREFIXO}ppt escolha*
â   _Pedra, papel ou tesoura_
â
ââ¤ ð¢ *${PREFIXO}adivinha*
â   _Adivinhar um nÃºmero_
â
ââ¤ ð¯ *${PREFIXO}chute nÃºmero*
â   _Dar um chute na adivinhaÃ§Ã£o_
â
ââ¤ ð¯ *${PREFIXO}chuterpg @pessoa*
â   _Desafiar alguÃ©m_
â
ââ¤ ð§  *${PREFIXO}quiz*
â   _Iniciar um quiz_
â
ââ¤ ð§  *${PREFIXO}quiz resposta*
â   _Responder o quiz_
â
ââ¤ â¡ *${PREFIXO}pokemon <nome>*
â   _Consultar um PokÃ©mon_
â
ââ¤ â¤ï¸ *${PREFIXO}ppp*
â   _Pega,pensa ou passa?_
â
ââ¯
â
â  ð° *ðððððððð*
â
ââ¤ âï¸ *${PREFIXO}minerar*
â   _Minerar e ganhar moedas_
â
ââ¤ ð¥· *${PREFIXO}roubar @pessoa*
â   _Tentar roubar alguÃ©m_
â
ââ¤ ð° *${PREFIXO}slots 100*
â   _Apostar moedas_
â
ââ¤ ð° *${PREFIXO}saldo*
â   _Ver seu saldo_
â
ââ¤ ðª *${PREFIXO}loja*
â   _Ver a loja_
â
ââ¤ ð *${PREFIXO}comprar <item>*
â   _Comprar um item_
â
ââ¤ ð *${PREFIXO}inventario*
â   _Ver seus itens_
â
ââ¤ ð¸ *${PREFIXO}doar 500 @pessoa*
â   _Doar moedas_
â
ââ¤ ð *${PREFIXO}rankingdinheiro*
â   _Ranking dos mais ricos_
â
ââ¯
â  ð *ððððð ðððððððð*
â
ââ¤ ð *${PREFIXO}ranklindo @pessoa*
â   _Rank de beleza_
ââ¤ ð¹ *${PREFIXO}rankfeio @pessoa*
â   _Rank de feiura_
ââ¤ ð³ï¸âð *${PREFIXO}rankgay @pessoa*
â   _Rank gay aleatÃ³rio_
ââ¤ ð *${PREFIXO}rankhetero @pessoa*
â   _Rank hetero aleatÃ³rio_
ââ¤ ð *${PREFIXO}ranklesbico @pessoa*
â   _Rank lÃ©sbico aleatÃ³rio_
ââ¤ ð§  *${PREFIXO}rankinteligente @pessoa*
â   _Rank de inteligÃªncia_
ââ¤ ðª *${PREFIXO}rankpobre*
â   _Ranking dos menores saldos_
ââ¤ ð¨ *${PREFIXO}csrank engraÃ§ado*
â   _Criar um rank personalizado_
ââ¤ ð *${PREFIXO}rankship @pessoa @pessoa*
â   _Rank de compatibilidade_
â
ââ¤ âï¸ *${PREFIXO}srank*
â   _Admins: configurar os rankings_
ââ¤ ð *${PREFIXO}rfixo*
â   _Admins: deixar resultados fixos_
ââ¤ ð² *${PREFIXO}raleatorio*
â   _Admins: sortear resultados novamente_
â
ââ¤ ð *${PREFIXO}sortearm 500*
â   _Sortear moedas (admins)_
â
ââ¯
â
â  âï¸ *ððð*
â
ââ¤ ð *${PREFIXO}tapa @pessoa*
â   _Dar um tapa_
â
ââ¤ ð *${PREFIXO}soco @pessoa*
â   _Dar um soco_
â
ââ¤ ð«· *${PREFIXO}empurrar @pessoa*
â   _Empurrar alguÃ©m_
â
ââ¤ ð¤ *${PREFIXO}abracar @pessoa*
â   _AbraÃ§ar alguÃ©m_
â
ââ¤ ð¡ï¸ *${PREFIXO}proteger @pessoa*
â   _Proteger alguÃ©m_
â
ââ¤ â¤ï¸ *${PREFIXO}curar @pessoa*
â   _Curar alguÃ©m_
â
ââ¤ ð *${PREFIXO}elogiar @pessoa*
â   _Elogiar alguÃ©m_
â
ââ¤ ð *${PREFIXO}zoar @pessoa*
â   _Zoar alguÃ©m_
â
ââ¤ âï¸ *${PREFIXO}duelo @pessoa*
â   _Iniciar um duelo_
â
ââ¤ ð¥· *${PREFIXO}roubar @pessoa*
â   _Tentar roubar alguÃ©m_
â
ââ¤ ðºï¸ *${PREFIXO}aventura*
â   _Iniciar uma aventura_
â
ââ¯
â
â  ð¡ï¸ *ðððððððÌ§ðÌð*
â
ââ¤ ð *${PREFIXO}mute @pessoa*
â   _Mutar alguÃ©m_
â
ââ¤ ð *${PREFIXO}unmute @pessoa*
â   _Desmutar alguÃ©m_
â
ââ¤ ð« *${PREFIXO}muteblacklist @pessoa*
â   _Adicionar Ã  blacklist de mute_
â
ââ¤ â *${PREFIXO}unmuteblacklist @pessoa*
â   _Remover da blacklist de mute_
â ð *;aviso HH:MM / mensagem*
â    Cria um aviso diÃ¡rio
â
â ðï¸ *;rem_aviso HH:MM*
â    Remove um aviso
â
â ð *;listaviso*
â    Lista os avisos do grupo
â
ââ¯
â
â  âï¸ *ðððððððððð*
â
ââ¤ ð *${PREFIXO}ping*
â   _Verificar o tempo de resposta_
â
ââ¤ ð *${PREFIXO}hora*
â   _Mostrar a hora_
â
ââ¤ â¹ï¸ *${PREFIXO}info*
â   _Mostrar informaÃ§Ãµes_
â
ââ¤ ð´ *${PREFIXO}afk motivo*
â   _Ativar modo AFK_
â
ââ¤ ð¯ *${PREFIXO}ttg*
â   _Comando TTG_
â
ââ¯
â
â  ð¼ï¸ *ððÌððð*
â
ââ¤ ð¼ï¸ *${PREFIXO}fig*
â   _Criar figurinha_
â
ââ¤ ð¼ï¸ *${PREFIXO}figurinha*
â   _Criar figurinha_
â
ââ¤ ð§© *${PREFIXO}emojimix emoji emoji*
â   _Combinar emojis_
â
ââ¤ ð *${PREFIXO}brat1 texto*
â   _Gerar imagem Brat 1_
â
ââ¤ ð *${PREFIXO}brat2 texto*
â   _Gerar imagem Brat 2_
â
ââ¤ ðµ *${PREFIXO}playm mÃºsica*
â   _Tocar mÃºsica_
â
ââ¤ ð£ï¸ *${PREFIXO}tts texto*
â   _Transformar texto em voz_
â
ââ¯
â
â  ðï¸ *ððððððð ðð ððð*
â
ââ¤ ð¿ï¸ *${PREFIXO}esquilo*
â   _Voz de esquilo_
ââ¤ ð¿ï¸ *${PREFIXO}chipmunk*
â   _Voz ainda mais aguda_
ââ¤ ð *${PREFIXO}agudo*
â   _Voz aguda_
ââ¤ ð¹ *${PREFIXO}demonio*
â   _Voz demonÃ­aca_
ââ¤ ð¿ *${PREFIXO}grave*
â   _Voz grave_
ââ¤ ð¤ *${PREFIXO}robo*
â   _Voz robÃ³tica_
ââ¤ ð» *${PREFIXO}radio*
â   _Efeito de rÃ¡dio_
ââ¤ âï¸ *${PREFIXO}telefone*
â   _Efeito de telefone_
ââ¤ ð¢ *${PREFIXO}megafone*
â   _Efeito de megafone_
ââ¤ ðï¸ *${PREFIXO}eco*
â   _Adicionar eco_
ââ¤ ð³ï¸ *${PREFIXO}cavern*
â   _Efeito de caverna_
ââ¤ ð½ *${PREFIXO}alien*
â   _Voz alienÃ­gena_
ââ¤ ð¥ *${PREFIXO}distorcido*
â   _Voz distorcida_
ââ¤ ð *${PREFIXO}reverso*
â   _Reproduzir ao contrÃ¡rio_
â
ââ¯
â
â  ð *ððððð*
â
ââ¤ ð *${PREFIXO}soadm*
â   _Alternar modo somente administradores_
â
ââ¤ ð *${PREFIXO}menu*
â   _Menu principal_
â
ââ¤ ð *${PREFIXO}relacionamentos*
â   _Menu de relacionamentos_
â
ââ¤ ð *${PREFIXO}diversao*
â   _Menu de diversÃ£o_
â
ââ¤ ð® *${PREFIXO}jogos*
â   _Menu de jogos_
â
ââ¤ âï¸ *${PREFIXO}rpg*
â   _Menu RPG_
â
ââ¤ ð¼ï¸ *${PREFIXO}midia*
â   _Menu de mÃ­dia_
â
ââ¤ ð¡ï¸ *${PREFIXO}moderacao*
â   _Menu de moderaÃ§Ã£o_
â
ââ¤ ð *${PREFIXO}apis*
â   _Menu de APIs_
â
ââ¤ âï¸ *${PREFIXO}utilidades*
â   _Menu de utilidades_
â
ââ¤ ð¤ *${PREFIXO}bot*
â   _Menu do bot_
â
ââ¯
â
â  ð­ *ððððððððððððð*\nâ\nââ¤ ð­ *${PREFIXO}personalidades*\nâ   _Ver personalidades disponÃ­veis_\nâ\nââ¤ âï¸ *${PREFIXO}personalidade <nome>*\nâ   _Alterar a personalidade do grupo_\nâ\nââ¯\nâ\nâ  ð¤ *ððð*
â
ââ¤ ð *${PREFIXO}comandos*
â   _Lista completa de comandos_
â
ââ¤ ð *${PREFIXO}changelog*
â   _Ver alteraÃ§Ãµes do bot_
â
ââ¤ â¹ï¸ *${PREFIXO}sobre*
â   _InformaÃ§Ãµes sobre o JUST BOT_
â
ââ¯
â
â  ð¡ *ðððð*
â
â  Use *${PREFIXO}menu* para acessar
â  os menus separados por categoria.
â
âââ¢âà¼ºðà¼»ââ¢ââ

*ðððððÌð ${VERSAO}*`
    );
}



// ============================================================
// DADO
// ============================================================

async function jogarDado(message) {
    const resultado =
        Math.floor(Math.random() * 6) + 1;

    await reagir(message, 'ð²');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ð² ðððð*
â
ââ¤ _VocÃª tirou:_
â
â       *ð² ${resultado}*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}


// ============================================================
// MOEDA
// ============================================================

async function jogarMoeda(message) {
    const resultado =
        Math.random() < 0.5
            ? 'ðððð'
            : 'ððððð';

    await reagir(message, 'ðª');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðª ððððð*
â
ââ¤ _Resultado:_
â
â       *${resultado}*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}


// ============================================================
// SIM OU NÃO
// ============================================================

async function jogarSN(message, pergunta) {
    if (!pergunta || !pergunta.trim()) {
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â *ðððððððð ððÌð ðððððððððð*

_Exemplo:_
*${PREFIXO}sn eu vou conseguir?*`
        );

        return;
    }

    const resultado =
        Math.random() < 0.5
            ? 'ððð'
            : 'ððÌð';

    await reagir(
        message,
        resultado === 'ððð'
            ? 'â'
            : 'â'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ð® ððð ðð ððÌð*
â
ââ¤ *ðððððððð:*
â   _${pergunta}_
â
ââ¤ *ðððððððð:*
â
â   â¦ *${resultado}* â¦
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *${emoji} ððð*
ââ¯
ââ¤ _${frase} ${mencao}_
â
ââ¤ *ðððð:* ${mencao}
ââ¤ *ð¥ ðððð ðððððÌððð:* ${valor}
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
        opcoesEnvio
    );
}

async function tapa(message) {
    await acaoRPG(
        message,
        'tapa',
        'ðï¸',
        [
            'VocÃª deu um tapa cinematogrÃ¡fico em',
            'VocÃª aplicou um tapinha lendÃ¡rio em',
            'VocÃª mandou aquele tapa de respeito em'
        ]
    );
}

async function soco(message) {
    await acaoRPG(
        message,
        'soco',
        'ð',
        [
            'VocÃª acertou um soco fictÃ­cio em',
            'VocÃª lanÃ§ou um soco poderoso contra',
            'VocÃª acertou um golpe crÃ­tico em'
        ]
    );
}

async function chuteRPG(message) {
    await acaoRPG(
        message,
        'chute',
        'ð¦µ',
        [
            'VocÃª deu um chute voador em',
            'VocÃª aplicou um chute giratÃ³rio em',
            'VocÃª acertou um chute cinematogrÃ¡fico em'
        ]
    );
}

async function empurrar(message) {
    await acaoRPG(
        message,
        'empurrar',
        'ð¨',
        [
            'VocÃª empurrou',
            'VocÃª deu um empurrÃ£o fictÃ­cio em',
            'VocÃª lanÃ§ou'
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

    await reagir(message, 'ð«');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð« ðððððÌ§ð*
ââ¯
ââ¤ _VocÃª deu um abraÃ§o em ${mencao}!_
â
ââ¤ *ð +100 ððððððð*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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

    await reagir(message, 'ð¡ï¸');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð¡ï¸ ðððððððð*
ââ¯
ââ¤ _VocÃª estÃ¡ protegendo ${mencao}!_
â
ââ¤ *ð¡ï¸ ðððððð ððððððððð*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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

    await reagir(message, 'ð');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð ðððð*
ââ¯
ââ¤ _VocÃª curou ${mencao}!_
â
ââ¤ *â¤ï¸ +${cura} HP ðððððÌððð*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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
        'VocÃª Ã© incrÃ­vel!',
        'VocÃª Ã© uma lenda!',
        'VocÃª Ã© simplesmente brabo!',
        'VocÃª mandou muito bem!',
        'VocÃª merece um trofÃ©u!'
    ];

    const elogio =
        elogios[
            Math.floor(
                Math.random() *
                elogios.length
            )
        ];

    await reagir(message, 'â­');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *â­ ðððððð*
ââ¯
ââ¤ ${mencao}
â
ââ¤ _${elogio}_
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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
        'perdeu atÃ© para o tutorial.',
        'precisa urgentemente de um buff.',
        'foi derrotado pelo prÃ³prio lag.',
        'entrou no modo NPC.',
        'tomou um crÃ­tico psicolÃ³gico.'
    ];

    const zoeira =
        zoeiras[
            Math.floor(
                Math.random() *
                zoeiras.length
            )
        ];

    await reagir(message, 'ð');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð ðððð*
ââ¯
ââ¤ ${mencao} _${zoeira}_
â
ââ¤ *ð ðððð ððððððððð: 999*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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
            'ð *ððððÌ ðððððð ð ððððð!*';
    } else if (
        seuPoder < poderInimigo
    ) {
        resultado =
            'ð *ððððÌ ðððððð ð ððððð!*';
    } else {
        resultado =
            'ð¤ *ðððððð!*';
    }

    await reagir(message, 'âï¸');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *âï¸ ððððð*
ââ¯
ââ¤ *ððððÌ VS ${mencao}*
â
ââ¤ *ððð ððððð:* ${seuPoder}
ââ¤ *ðððððððð:* ${poderInimigo}
â
ââ¯ ${resultado}
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
        opcoesEnvio
    );
}

async function roubar(message) {
    try {
        if (!message.from.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, 'â _Roubo sÃ³ pode ser feito em grupos._');
            return;
        }

        const pessoa = await exigirPessoa(message);
        if (!pessoa) return;

        const ladrao = await resolverIdEconomia(obterIdRemetente(message));
        const vitima = await resolverIdEconomia(pessoa);
        if (!ladrao || !vitima || idsIguais(ladrao, vitima)) {
            await reagir(message, 'â');
            await responderCitando(message, 'â _VocÃª nÃ£o pode roubar a si mesmo._');
            return;
        }

        const agora = Date.now();
        const chaveCooldown = `${ladrao}:${vitima}`;
        const ultimoAlvo = cooldownsRoubo.get(chaveCooldown) || 0;
        const restanteAlvo = INTERVALO_MESMA_VITIMA - (agora - ultimoAlvo);

        if (ultimoAlvo && restanteAlvo > 0) {
            const horas = Math.floor(restanteAlvo / 3600000);
            const minutos = Math.ceil((restanteAlvo % 3600000) / 60000);
            await reagir(message, 'â³');
            await responderCitando(message, `â³ _VocÃª jÃ¡ tentou roubar ${mencaoDaPessoa(pessoa)} recentemente._\n\nVolte em aproximadamente *${horas}h ${minutos}min*.`, { mentions: [vitima] });
            return;
        }

        const ultimoRoubo = cooldownsRoubo.get(`${ladrao}:geral`) || 0;
        if (agora - ultimoRoubo < INTERVALO_ROUBO) {
            const restante = INTERVALO_ROUBO - (agora - ultimoRoubo);
            const minutos = Math.ceil(restante / 60000);
            await reagir(message, 'â³');
            await responderCitando(message, `â³ _VocÃª precisa esperar mais *${minutos} min* antes de tentar outro roubo._`);
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
            await reagir(message, 'ð¸');
            await responderCitando(message, `ð¸ _${mencao} estÃ¡ praticamente sem moedas para roubar._`);
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

            await reagir(message, 'ð¥·');
            await responderCitando(message, `âââ¢âà¼ºð¥·à¼»ââ¢ââ
ââ¯ *ððððð ððð-ðððððððð!*
â
ââ¤ VocÃª roubou *${formatarMoedas(valorRoubo)} ðª* de ${mencao}!
ââ¤ ð¥· Chance extra das luvas: *${luvas}x*
â
ââ¤ ð° Seu saldo: *${formatarMoedas(carteiraLadrao.saldo)} ðª*
â
âââ¢âà¼ºð¥·à¼»ââ¢ââ` , { mentions: [vitima] });
            return;
        }

        const dados = dadosRoubo.get(ladrao) || { pegos: 0 };
        dados.pegos += 1;
        dadosRoubo.set(ladrao, dados);

        if (dados.pegos < 2) {
            salvarMoedas();
            await reagir(message, 'ð¨');
            await responderCitando(message, `âââ¢âà¼ºð¨à¼»ââ¢ââ
ââ¯ *ððððÌ ððð ðððð!*
â
ââ¤ ${mencao} percebeu o roubo!
ââ¤ ð¨ Primeira captura registrada.
ââ¤ â ï¸ Na *segunda captura*, vocÃª poderÃ¡ perder parte do seu saldo para a vÃ­tima.
â
âââ¢âà¼ºð¨à¼»ââ¢ââ`, { mentions: [vitima] });
            return;
        }

        dados.pegos = 0;
        const colete = quantidadeItem(ladrao, 'colete');
        if (colete > 0) {
            consumirItem(ladrao, 'colete');
            salvarMoedas();
            await reagir(message, 'ð¡ï¸');
            await responderCitando(message, `âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ
ââ¯ *ðððððð ððððððð!*
â
ââ¤ VocÃª foi pego pela *segunda vez*.
ââ¤ ð¡ï¸ Seu Colete Anti-PuniÃ§Ã£o absorveu a perda!
ââ¤ ${mencao} nÃ£o recebeu moedas desta vez.
â
âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ`, { mentions: [vitima] });
            return;
        }

        const perda = Math.min(carteiraLadrao.saldo, Math.max(100, Math.floor(carteiraLadrao.saldo * 0.20)));
        if (perda > 0) {
            transferirMoedas(ladrao, vitima, perda, 'puniÃ§Ã£o_roubo', 'Segunda captura no roubo');
        }

        await reagir(message, 'ð¸');
        await responderCitando(message, `âââ¢âà¼ºð¸à¼»ââ¢ââ
ââ¯ *ððððððð ððððððð!*
â
ââ¤ ð¨ VocÃª foi pego roubando ${mencao} pela segunda vez.
ââ¤ ð¸ Multa: *${formatarMoedas(perda)} ðª*
ââ¤ ð° Esse dinheiro foi entregue Ã  vÃ­tima.
â
ââ¤ Seu saldo: *${formatarMoedas(carteiraLadrao.saldo)} ðª*
â
âââ¢âà¼ºð¸à¼»ââ¢ââ`, { mentions: [vitima] });
    } catch (erro) {
        console.error('â Erro no sistema de roubo:', erro);
        await reagir(message, 'â');
        await responderCitando(message, 'â _Ocorreu um erro ao executar o roubo._');
    }
}

async function aventura(message) {
    const eventos = [
        'ð° VocÃª encontrou um castelo abandonado!',
        'ð Um dragÃ£o apareceu no caminho!',
        'ð VocÃª encontrou um tesouro escondido!',
        'ð² VocÃª entrou em uma floresta misteriosa!',
        'ð§ Um mago ofereceu uma missÃ£o!',
        'ð³ï¸ VocÃª caiu em uma passagem secreta!'
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

    await reagir(message, 'ðºï¸');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ðºï¸ ðððððððð*
ââ¯
ââ¤ _${evento}_
â
ââ¤ *â¨ XP GANHO: ${xp}*
â
ââ¤ _A aventura continua..._
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
    await reagir(message, 'â');

    await responderCitando(
        message,
        `â *ððððððð ððÌð ððððððððð.*

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
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â *ððððððð ððððÌðððð!*

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
            'ð¤ *ðððððð!*';
    } else if (
        (escolha === 'pedra' &&
            bot === 'tesoura') ||
        (escolha === 'papel' &&
            bot === 'pedra') ||
        (escolha === 'tesoura' &&
            bot === 'papel')
    ) {
        resultado =
            'ð *ððððÌ ðððððð!*';
    } else {
        resultado =
            'ð *ððððÌ ðððððð!*';
    }

    await reagir(message, 'ð®');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð® ððð*
ââ¯
ââ¤ *ððððÌ:* _${escolha}_
ââ¤ *ððð:* _${bot}_
â
ââ¯ ${resultado}
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}


// ============================================================
// ADIVINHAÃÃO
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

    await reagir(message, 'ð¢');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð¢ ðððððððð*
ââ¯
ââ¤ _Pensei em um nÃºmero entre 1 e 10!_
â
ââ¤ *ð¯ ${PREFIXO}chute nÃºmero*
â   _Tente acertar._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
            `â *ðððððð ðððð ððððð.*

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
            'â _Digite um nÃºmero entre 1 e 10._'
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
            'ð'
        );

        await responderCitando(
            message,
            `ð *ððððððð!*

_O nÃºmero era_ *${numeroCorreto}*!`
        );

        return;
    }

    await reagir(message, 'â');

    await responderCitando(
        message,
        `â *ððððð!*

_O nÃºmero Ã©_ *${numeroEscolhido < numeroCorreto
            ? 'MAIOR'
            : 'MENOR'}*.`
    );
}


// ============================================================
// ð COMANDOS DE APIS PÃBLICAS
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
    if (!nome) { await reagir(message, 'â'); await responderCitando(message, `â _Informe um PokÃ©mon._\n\nExemplo: *${PREFIXO}pokemon pikachu*`); return; }
    try {
        const pokemon = await buscarJsonAPI(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`);
        const tipos = (pokemon.types || []).sort((a,b) => a.slot-b.slot).map(item => nomeFormatadoAPI(item.type?.name)).join(' / ');
        const habilidades = (pokemon.abilities || []).filter(item => item.ability?.name).map(item => nomeFormatadoAPI(item.ability.name)).slice(0,3).join(', ');
        const stats = Object.fromEntries((pokemon.stats || []).map(item => [item.stat?.name, item.base_stat]));
        const texto = `âââ¢âà¼ºâ¡à¼»ââ¢ââ\nâ      *ððððÌððð*\nââ¯\nâ\nââ¤ ð *#${String(pokemon.id).padStart(4,'0')}*\nââ¤ ð¾ *${nomeFormatadoAPI(pokemon.name)}*\nââ¤ ð¥ Tipo: *${tipos || 'Desconhecido'}*\nââ¤ ð Altura: *${(pokemon.height/10).toFixed(1)} m*\nââ¤ âï¸ Peso: *${(pokemon.weight/10).toFixed(1)} kg*\nâ\nââ¤ â¤ï¸ HP: *${stats.hp ?? '?'}*\nââ¤ âï¸ Ataque: *${stats.attack ?? '?'}*\nââ¤ ð¡ï¸ Defesa: *${stats.defense ?? '?'}*\nââ¤ â¨ Ataque Esp.: *${stats['special-attack'] ?? '?'}*\nââ¤ ð Defesa Esp.: *${stats['special-defense'] ?? '?'}*\nââ¤ ð¨ Velocidade: *${stats.speed ?? '?'}*\nâ\nââ¤ ð§¬ Habilidades: *${habilidades || 'Desconhecidas'}*\nâ\nâââ¢âà¼ºâ¡à¼»ââ¢ââ`;
        await reagir(message,'â¡'); await responderCitando(message,texto);
    } catch (erro) { console.error('â Erro na API do PokÃ©mon:',erro.message); await reagir(message,'â'); await responderCitando(message,`â _NÃ£o encontrei o PokÃ©mon_ *${nome}* _na PokÃ©API._`); }
}

async function comandoPiadaAPI(message) {
    try {
        const dados = await buscarJsonAPI('https://v2.jokeapi.dev/joke/Any?lang=pt&blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
        if (dados.error) throw new Error(dados.message || 'API sem piada.');
        const piada = dados.type === 'twopart' ? `${limparTextoAPI(dados.setup)}\n\n${limparTextoAPI(dados.delivery)}` : limparTextoAPI(dados.joke);
        if (!piada) throw new Error('Piada vazia.');
        await reagir(message,'ð'); await responderCitando(message,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððð ðð ððð*\nââ¯\nâ\nââ¤ ${piada}\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
    } catch (erro) { console.error('â Erro na API de piadas:',erro.message); await reagir(message,'â'); await responderCitando(message,'â _NÃ£o consegui buscar uma piada agora. Tente novamente em alguns segundos._'); }
}

async function comandoAnime(message, argumentos) {
    const busca = String(argumentos || '').trim();
    if (!busca) { await reagir(message,'â'); await responderCitando(message,`â _Informe o nome de um anime._\n\nExemplo: *${PREFIXO}anime naruto*`); return; }
    try {
        const dados = await buscarJsonAPI(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(busca)}&limit=1`); const anime = dados?.data?.[0];
        if (!anime) throw new Error('Anime nÃ£o encontrado.');
        const ano = anime.year || anime.aired?.prop?.from?.slice?.(0,4) || 'N/A'; const generos = (anime.genres || []).slice(0,5).map(g => g.name).join(', ') || 'N/A';
        const texto = `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ        *ððððð*\nââ¯\nâ\nââ¤ ð¬ *${limparTextoAPI(anime.title)}*\nââ¤ â­ Nota: *${anime.score ?? 'N/A'}*\nââ¤ ðº EpisÃ³dios: *${anime.episodes ?? 'N/A'}*\nââ¤ ð Ano: *${ano}*\nââ¤ ð Status: *${limparTextoAPI(anime.status || 'N/A')}*\nââ¤ ð·ï¸ GÃªneros: *${limparTextoAPI(generos)}*\nâ\nââ¤ ð *Sinopse:*\nâ   ${limitarTextoAPI(anime.synopsis || 'Sinopse nÃ£o disponÃ­vel.',650)}\nâ\nâââ¢âà¼ºð¥à¼»ââ¢ââ`;
        await reagir(message,'ð¥'); await responderCitando(message,texto);
    } catch (erro) { console.error('â Erro na API de anime:',erro.message); await reagir(message,'â'); await responderCitando(message,`â _NÃ£o consegui encontrar o anime_ *${busca}* _agora._`); }
}

function embaralharAPI(lista) { const copia=[...lista]; for(let i=copia.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copia[i],copia[j]]=[copia[j],copia[i]];} return copia; }

async function comandoQuizAPI(message) {
    try {
        const dados=await buscarJsonAPI('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
        if(!dados?.results?.length || dados.response_code!==0) throw new Error(`Open Trivia DB response_code=${dados?.response_code}`);
        const bruto=dados.results[0]; const pergunta=limparTextoAPI(decodeURIComponent(bruto.question)); const correta=limparTextoAPI(decodeURIComponent(bruto.correct_answer));
        const alternativas=embaralharAPI([correta,...(bruto.incorrect_answers||[]).map(x=>limparTextoAPI(decodeURIComponent(x)))]); const letras=['a','b','c','d']; const respostaCorreta=letras[alternativas.findIndex(x=>x===correta)];
        const opcoes=alternativas.map((x,i)=>`${letras[i].toUpperCase()}) ${x}`).join('\n'); quizzes.set(message.from,{pergunta,opcoes,resposta:respostaCorreta});
        await reagir(message,'ð§ '); await responderCitando(message,`âââ¢âà¼ºð§ à¼»ââ¢ââ\nâ      *ðððð ðð ððð*\nââ¯\nâ\nââ¤ _${pergunta}_\nâ\n${opcoes}\nâ\nââ¤ *ð ${PREFIXO}quiz a/b/c/d*\nâ   _Escolha uma alternativa._\nâ\nâââ¢âà¼ºð§ à¼»ââ¢ââ`);
    } catch (erro) { console.error('â Erro na API do quiz:',erro.message); await reagir(message,'â'); await responderCitando(message,'â _NÃ£o consegui buscar uma pergunta agora. Tente novamente em alguns segundos._'); }
}

async function comandoClima(message, argumentos) {
    const cidade=String(argumentos||'').trim(); if(!cidade){await reagir(message,'â');await responderCitando(message,`â _Informe uma cidade._\n\nExemplo: *${PREFIXO}clima SÃ£o Paulo*`);return;}
    try {
        const geo=await buscarJsonAPI(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`); const local=geo?.results?.[0]; if(!local) throw new Error('Cidade nÃ£o encontrada.');
        const clima=await buscarJsonAPI(`https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto`);
        const codigos={0:'âï¸ CÃ©u limpo',1:'ð¤ï¸ Principalmente limpo',2:'â Parcialmente nublado',3:'âï¸ Nublado',45:'ð«ï¸ Nevoeiro',48:'ð«ï¸ Nevoeiro com geada',51:'ð¦ï¸ Chuvisco leve',53:'ð¦ï¸ Chuvisco moderado',55:'ð§ï¸ Chuvisco intenso',61:'ð¦ï¸ Chuva leve',63:'ð§ï¸ Chuva moderada',65:'ð§ï¸ Chuva forte',71:'ð¨ï¸ Neve leve',73:'ð¨ï¸ Neve moderada',75:'âï¸ Neve forte',80:'ð¦ï¸ Pancadas de chuva',81:'ð§ï¸ Pancadas moderadas',82:'âï¸ Pancadas fortes',95:'âï¸ Trovoada',96:'âï¸ Trovoada com granizo',99:'âï¸ Trovoada forte com granizo'}; const atual=clima.current||{}; const diaria=clima.daily||{}; const regiao=[local.admin1,local.country].filter(Boolean).join(', ');
        const texto=`âââ¢âà¼ºð¦ï¸à¼»ââ¢ââ\nâ       *ððððð*\nââ¯\nâ\nââ¤ ð *${local.name||cidade}*\nââ¤ ð ${regiao}\nâ\nââ¤ ${codigos[atual.weather_code]||'ð¡ï¸ CondiÃ§Ã£o desconhecida'}\nââ¤ ð¡ï¸ Temperatura: *${atual.temperature_2m??'?'}Â°C*\nââ¤ ð¤ SensaÃ§Ã£o: *${atual.apparent_temperature??'?'}Â°C*\nââ¤ ð§ Umidade: *${atual.relative_humidity_2m??'?'}%*\nââ¤ ð¨ Vento: *${atual.wind_speed_10m??'?'} km/h*\nâ\nââ¤ ðº MÃ¡xima: *${diaria.temperature_2m_max?.[0]??'?'}Â°C*\nââ¤ ð» MÃ­nima: *${diaria.temperature_2m_min?.[0]??'?'}Â°C*\nââ¤ â Chance de chuva: *${diaria.precipitation_probability_max?.[0]??'?'}%*\nâ\nâââ¢âà¼ºð¦ï¸à¼»ââ¢ââ`; await reagir(message,'ð¦ï¸'); await responderCitando(message,texto);
    } catch(erro){console.error('â Erro na API de clima:',erro.message);await reagir(message,'â');await responderCitando(message,`â _NÃ£o consegui consultar o clima de_ *${cidade}* _agora._`);}
}

// ============================================================
// ð NOVAS APIS: QR, SHAZAM, FUTEBOL, F1 E QUALIDADE DO AR
// ============================================================

async function comandoQR(message, argumentos) {
    const conteudo = String(argumentos || '').trim();
    if (!conteudo) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe o texto ou link para gerar o QR Code._\n\nExemplo: *${PREFIXO}qr https://youtube.com*`);
        return;
    }

    if (conteudo.length > 900) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _O conteÃºdo do QR Code Ã© grande demais. Tente usar atÃ© 900 caracteres._');
        return;
    }

    try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=700x700&format=png&data=${encodeURIComponent(conteudo)}`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const bytes = Buffer.from(await resposta.arrayBuffer());
        const midia = new MessageMedia('image/png', bytes.toString('base64'), 'qrcode.png');

        await reagir(message, 'ð±');
        await client.sendMessage(message.from, midia, {
            caption: `ð± *ðð ðððð*\n\nð _ConteÃºdo codificado com sucesso._`
        });
    } catch (erro) {
        console.error('â Erro na API de QR Code:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui gerar o QR Code agora. Tente novamente em alguns segundos._');
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
                reject(new Error(`FFmpeg terminou com cÃ³digo ${codigo}: ${erroFFmpeg.trim()}`));
                return;
            }
            const pcm = Buffer.concat(partes);
            if (!pcm.length) {
                reject(new Error('Nenhum Ã¡udio PCM foi produzido.'));
                return;
            }
            resolve(pcm);
        });
    });
}

async function comandoShazam(message) {
    if (!SHAZAM_API_KEY) {
        await reagir(message, 'ð');
        await responderCitando(message, 'ð *ðððððð ððÌð ððððððððððð*\n\n_O comando precisa da variÃ¡vel de ambiente_ `SHAZAM_API_KEY` _no computador/servidor do bot._');
        return;
    }

    if (!message.hasMedia) {
        await reagir(message, 'ðµ');
        await responderCitando(message, `ðµ _Envie um Ã¡udio junto com_ *${PREFIXO}shazam* _ou responda a um Ã¡udio com o comando._`);
        return;
    }

    const pastaTemporaria = path.join(os.tmpdir(), 'justbot-shazam');
    fs.mkdirSync(pastaTemporaria, { recursive: true });
    const idTemporario = `${Date.now()}-${String(message.id?.id || 'audio').replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const arquivoEntrada = path.join(pastaTemporaria, `${idTemporario}.audio`);

    try {
        await reagir(message, 'ðµ');
        const midia = await message.downloadMedia();
        if (!midia || !midia.data) throw new Error('NÃ£o foi possÃ­vel baixar o Ã¡udio.');

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
            await reagir(message, 'â');
            await responderCitando(message, 'â _NÃ£o consegui identificar essa mÃºsica. Tente enviar um trecho com Ã¡udio mais limpo e com alguns segundos de duraÃ§Ã£o._');
            return;
        }

        const metadados = Array.isArray(faixa.sections?.[0]?.metadata) ? faixa.sections[0].metadata : [];
        const album = metadados.find(item => item.title === 'Album')?.text || 'N/A';
        const lancamento = metadados.find(item => item.title === 'Released')?.text || 'N/A';
        const genero = faixa.genres?.primary || 'N/A';
        const capaUrl = faixa.images?.coverart || faixa.images?.coverarthq || null;
        const urlFaixa = faixa.url || null;

        const texto = `âââ¢âà¼ºðµà¼»ââ¢ââ\nâ       *ðððððð*\nââ¯\nâ\nââ¤ ð¶ *${limparTextoAPI(faixa.title)}*\nââ¤ ð¤ Artista: *${limparTextoAPI(faixa.subtitle || 'N/A')}*\nââ¤ ð¿ Ãlbum: *${limparTextoAPI(album)}*\nââ¤ ð LanÃ§amento: *${limparTextoAPI(lancamento)}*\nââ¤ ð¼ GÃªnero: *${limparTextoAPI(genero)}*\n${urlFaixa ? `ââ¤ ð ${urlFaixa}\n` : ''}â\nâââ¢âà¼ºðµà¼»ââ¢ââ`;

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
                console.log('â ï¸ NÃ£o foi possÃ­vel baixar a capa do Shazam:', erroCapa.message);
            }
        }

        await responderCitando(message, texto);
    } catch (erro) {
        console.error('â Erro na API do Shazam:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui identificar a mÃºsica agora. Verifique se a chave do Shazam estÃ¡ vÃ¡lida e tente novamente._');
    } finally {
        try {
            if (fs.existsSync(arquivoEntrada)) fs.unlinkSync(arquivoEntrada);
        } catch (erroLimpeza) {
            console.log('â ï¸ NÃ£o foi possÃ­vel limpar arquivo temporÃ¡rio do Shazam:', erroLimpeza.message);
        }
    }
}

async function buscarApiFootball(endpoint, parametros = {}) {
    if (!API_FOOTBALL_KEY) throw new Error('API_FOOTBALL_KEY nÃ£o configurada.');
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
        await reagir(message, 'ð');
        await responderCitando(message, 'ð *ððððððð ððÌð ððððððððððð*\n\n_O comando precisa da variÃ¡vel de ambiente_ `API_FOOTBALL_KEY` _no computador/servidor do bot._');
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
            await reagir(message, 'â½');
            await responderCitando(message, aoVivo ? 'â½ _NÃ£o hÃ¡ partidas ao vivo encontradas agora._' : `â½ _NÃ£o encontrei partidas para_ *${dataHojeSaoPaulo()}* _nas competiÃ§Ãµes disponÃ­veis._`);
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
            const competicao = jogo.league?.name || 'CompetiÃ§Ã£o';
            return `ââ¤ ð *${limitarTextoAPI(competicao, 45)}*\nâ   ð ${tempo} â¢ *${status}*\nâ   â½ ${limitarTextoAPI(casa, 28)} ${placar} ${limitarTextoAPI(fora, 28)}`;
        }).join('\nâ\n');

        const titulo = aoVivo ? 'ððððððð ðð ðððð' : `ððððððð â¢ ${dataHojeSaoPaulo()}`;
        await reagir(message, 'â½');
        await responderCitando(message, `âââ¢âà¼ºâ½à¼»ââ¢ââ\nâ      *${titulo}*\nââ¯\nâ\n${lista}\nâ\nââ¤ _Mostrando atÃ© 12 partidas._\nâââ¢âà¼ºâ½à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro na API de futebol:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui consultar os jogos agora. A API pode estar temporariamente indisponÃ­vel ou a chave pode ter atingido o limite diÃ¡rio._');
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
        if (!modo || ['proxima', 'prÃ³xima', 'next'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/next/races/?limit=1'));
            const corrida = dados?.RaceTable?.Races?.[0];
            if (!corrida) throw new Error('PrÃ³xima corrida nÃ£o encontrada.');
            const data = corrida.date ? new Date(`${corrida.date}T${corrida.time || '00:00:00Z'}`).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
            const circuito = corrida.Circuit?.circuitName || 'N/A';
            const local = corrida.Circuit?.Location?.locality && corrida.Circuit?.Location?.country ? `${corrida.Circuit.Location.locality}, ${corrida.Circuit.Location.country}` : 'N/A';
            await reagir(message, 'ðï¸');
            await responderCitando(message, `âââ¢âà¼ºðï¸à¼»ââ¢ââ\nâ       *ðð â¢ ðððÌðððð*\nââ¯\nâ\nââ¤ ð *${limparTextoAPI(corrida.raceName)}*\nââ¤ ð ${limparTextoAPI(circuito)}\nââ¤ ð ${limparTextoAPI(local)}\nââ¤ ð ${data}\nââ¤ ð¢ Rodada: *${corrida.round || 'N/A'}*\nâ\nâââ¢âà¼ºðï¸à¼»ââ¢ââ`);
            return;
        }

        if (['calendario', 'calendar', 'corridas'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/races/?limit=30'));
            const corridas = dados?.RaceTable?.Races || [];
            if (!corridas.length) throw new Error('CalendÃ¡rio vazio.');
            const lista = corridas.map(corrida => `ââ¤ *${corrida.round || '?'}.* ${limparTextoAPI(corrida.raceName)}\nâ   ð ${corrida.date || 'N/A'} â¢ ð ${limparTextoAPI(corrida.Circuit?.circuitName || 'N/A')}`).join('\nâ\n');
            await reagir(message, 'ð');
            await responderCitando(message, `âââ¢âà¼ºðï¸à¼»ââ¢ââ\nâ       *ðððððððÌððð ðð*\nââ¯\nâ\n${lista}\nâ\nâââ¢âà¼ºðï¸à¼»ââ¢ââ`);
            return;
        }

        if (['classificacao', 'classificaÃ§Ã£o', 'ranking', 'pilotos'].includes(modo)) {
            const dados = extrairMRData(await buscarF1API('current/driverstandings/?limit=20'));
            const standings = dados?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
            if (!standings.length) throw new Error('ClassificaÃ§Ã£o vazia.');
            const lista = standings.slice(0, 20).map(item => `ââ¤ *${item.position || '?'}Âº* ${limparTextoAPI(`${item.Driver?.givenName || ''} ${item.Driver?.familyName || ''}`)} â¢ *${item.points || 0} pts*\nâ   ðï¸ ${limparTextoAPI(item.Constructors?.[0]?.name || 'N/A')}`).join('\nâ\n');
            await reagir(message, 'ð');
            await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ðððððððððððÌ§ðÌð ðð*\nââ¯\nâ\n${lista}\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
            return;
        }

        await reagir(message, 'â');
        await responderCitando(message, `â _OpÃ§Ã£o de F1 nÃ£o reconhecida._\n\nUse:\n*${PREFIXO}f1*\n*${PREFIXO}f1 calendario*\n*${PREFIXO}f1 classificacao*`);
    } catch (erro) {
        console.error('â Erro na API de F1:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui consultar os dados da FÃ³rmula 1 agora. Tente novamente em alguns segundos._');
    }
}

async function comandoQualidadeAr(message, argumentos) {
    const cidade = String(argumentos || '').trim();
    if (!cidade) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe uma cidade._\n\nExemplo: *${PREFIXO}ar SÃ£o Paulo*`);
        return;
    }

    try {
        const geo = await buscarJsonAPI(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`);
        const local = geo?.results?.[0];
        if (!local) throw new Error('Cidade nÃ£o encontrada.');

        const dados = await buscarJsonAPI(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${local.latitude}&longitude=${local.longitude}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`);
        const atual = dados?.current || {};
        const aqi = atual.european_aqi;
        const classificacao = aqi === undefined || aqi === null ? 'N/A' : aqi <= 20 ? 'ð¢ Boa' : aqi <= 40 ? 'ð¡ RazoÃ¡vel' : aqi <= 60 ? 'ð  Moderada' : aqi <= 80 ? 'ð´ Ruim' : aqi <= 100 ? 'ð£ Muito ruim' : 'â« Extremamente ruim';

        await reagir(message, 'ð«ï¸');
        await responderCitando(message, `âââ¢âà¼ºð«ï¸à¼»ââ¢ââ\nâ    *ððððððððð ðð ðð*\nââ¯\nâ\nââ¤ ð *${limparTextoAPI(local.name)}, ${limparTextoAPI(local.country || '')}*\nââ¤ ð«ï¸ AQI europeu: *${aqi ?? 'N/A'}*\nââ¤ ð ClassificaÃ§Ã£o: *${classificacao}*\nâ\nââ¤ ð¨ PM2.5: *${atual.pm2_5 ?? 'N/A'} Âµg/mÂ³*\nââ¤ ð¨ PM10: *${atual.pm10 ?? 'N/A'} Âµg/mÂ³*\nââ¤ ð§ª NOâ: *${atual.nitrogen_dioxide ?? 'N/A'} Âµg/mÂ³*\nââ¤ ð§ª Oâ: *${atual.ozone ?? 'N/A'} Âµg/mÂ³*\nââ¤ ð§ª SOâ: *${atual.sulphur_dioxide ?? 'N/A'} Âµg/mÂ³*\nâ\nâââ¢âà¼ºð«ï¸à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro na API de qualidade do ar:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, `â _NÃ£o consegui consultar a qualidade do ar de_ *${cidade}* _agora._`);
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
            `â *ððððððð ðððððððð ððððð.*

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
            'â _Responda apenas com A, B, C ou D._'
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
            'ð'
        );

        await responderCitando(
            message,
            'ð *ðððððððð ððððððð!*'
        );

    } else {
        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `â *ðððððððð ðððððð!*

_A resposta correta era:_
*${pergunta.resposta.toUpperCase()}*`
        );
    }
}


// ============================================================
// PING
// ============================================================

async function ping(message) {
    await reagir(message, 'ð');

    await responderCitando(
        message,
        `ð *ðððð!*

*ð¤ ${NOME_BOT}*
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

    await reagir(message, 'ð');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ð ðððð*
â
ââ¤ *${hora}*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}


// ============================================================
// INFO
// ============================================================

async function mostrarInfo(message) {
    await reagir(message, 'â¹ï¸');

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *â¹ï¸ ðððð*
ââ¯
ââ¤ *ð¤ ððð:* ${NOME_BOT}
ââ¤ *ð¦ ðððððÌð:* ${VERSAO}
ââ¤ *ð¢ ðððððð:* Online
ââ¤ *âï¸ ðððððððððð:* Node.js
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}

// ============================================================
// ð¼ï¸ OBTER FOTO DE PERFIL DIRETAMENTE DO WHATSAPP WEB
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
                                erro: 'NÃ£o foi possÃ­vel criar o WID.'
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
                                erro: 'Chat nÃ£o encontrado.'
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
                                erro: 'WhatsApp nÃ£o retornou uma foto.'
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
            'ð¼ï¸ RESULTADO FOTO DIRETA:',
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
            'â Erro ao obter foto diretamente:',
            erro
        );

        return null;
    }
}

// ============================================================
// ð¤ MOSTRAR PERFIL
// ============================================================

async function mostrarPerfil(message) {

    try {

        // ========================================================
        // 1. DESCOBRIR DE QUEM Ã O PERFIL
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
                    'â ï¸ Erro ao obter pessoa respondida:',
                    erro.message
                );
            }
        }

        // ========================================================
        // 3. SE NÃO INFORMOU NINGUÃM, MOSTRAR O PRÃPRIO PERFIL
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
                'â'
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
        // 5. CALCULAR PROGRESSO PARA O PRÃXIMO NÃVEL
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
            'â°'.repeat(
                blocosCheios
            ) +
            'â±'.repeat(
                totalBlocos -
                blocosCheios
            );

        // ========================================================
        // 7. CRIAR MENÃÃO
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
                'â Foto de perfil carregada!'
            );

        } catch (erroDownload) {

            console.log(
                'â ï¸ NÃ£o foi possÃ­vel baixar a foto:',
                erroDownload.message
            );
        }

    } else {

        console.log(
            'â¹ï¸ Nenhuma foto de perfil disponÃ­vel.'
        );
    }

} catch (erroFoto) {

    console.log(
        'â ï¸ Erro ao obter foto de perfil:',
        erroFoto.message
    );
}

        // ========================================================
        // 9. MONTAR PERFIL
        // ========================================================

        const textoPerfil =
`âââ¢âà¼ºð¤à¼»ââ¢ââ
â   *ð¤ ðððððð*
ââ¯
ââ¤ ${mencao}
â
ââ¤ â­ *ððÌððð*
â   â *NÃ­vel ${dados.nivel}*
â
ââ¤ â¨ *ðð ððððð*
â   â *${dados.xp} XP*
â
ââ¤ ð¬ *ððððððððð*
â   â *${dados.mensagens}*
â
ââ¤ ð *ððððððððð*
â   â ${barraXP}
â
ââ¤ ð¯ *ððÃðððð ððÌððð*
â   â *${xpRestante} XP restantes*
â
âââ¢âà¼ºð¤à¼»ââ¢ââ`;

        // ========================================================
        // 10. ENVIAR RESPONDENDO Ã MENSAGEM
        // ========================================================

        await reagir(
            message,
            'ð¤'
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
            'â Erro ao mostrar perfil:',
            erro
        );

        await reagir(
            message,
            'â'
        );
    }
}

// ============================================================
// ð MOSTRAR RANKING DE XP
// ============================================================

async function mostrarRanking(message) {

    try {

        // ========================================================
        // 1. VERIFICAR SE ESTÃ EM GRUPO
        // ========================================================

        if (
            !message.from ||
            !message.from.endsWith('@g.us')
        ) {

            await reagir(
                message,
                'â'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ððððððð ðð ðð*
ââ¯
â
ââ¤ â Este comando sÃ³ pode
â   ser usado em grupos.
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
                'ð'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ððððððð ðð ðð*
ââ¯
â
ââ¤ ð Ainda nÃ£o existem
â   jogadores no ranking.
â
ââ¤ _Comecem a conversar
â   para ganhar XP!_ â­
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
        // Se ainda empatar, mantÃ©m uma ordem estÃ¡vel pelo ID.
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
        // 5. ENCONTRAR POSIÃÃO DO USUÃRIO
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
            'ð¥',
            'ð¥',
            'ð¥'
        ];

        let textoRanking =
            `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ððððððð ðð ðð*
ââ¯
â
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
                `${posicao}ï¸â£`;

            const mencao =
                `@${String(
                    jogador.id
                ).split('@')[0]}`;

            idsMencao.push(
                jogador.id
            );

            textoRanking +=
                `ââ¤ ${emojiPosicao} *${posicao}Âº* ${mencao}
â   â­ NÃ­vel *${jogador.nivel}* â¢ *${jogador.xp} XP*
â   ð¬ ${jogador.mensagens} mensagem${jogador.mensagens === 1 ? '' : 'ns'}
â
`;
        }

        textoRanking +=
            `âââââââââââââââââââ`;

        // ========================================================
        // 7. MOSTRAR POSIÃÃO DO USUÃRIO
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

ð¤ *SUA POSIÃÃO*

â *${posicao}Âº lugar*
â­ NÃ­vel *${jogadorUsuario.nivel}*
â¨ *${jogadorUsuario.xp} XP*
ð¬ *${jogadorUsuario.mensagens} mensagens*`;
        }

        textoRanking +=
            `

âââ¢âà¼ºðà¼»ââ¢ââ`;

        // ========================================================
        // 8. ENVIAR
        // ========================================================

        await reagir(
            message,
            'ð'
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
            'â Erro ao mostrar ranking:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            'â _Ocorreu um erro ao carregar o ranking de XP._'
        );
    }
}

// ============================================================
// ============================================================
// ð¶ MOSTRAR RANKING DE FILHOS
// ============================================================

async function mostrarRankingFilhos(message) {

    try {

        if (
            !message.from ||
            !message.from.endsWith('@g.us')
        ) {

            await reagir(
                message,
                'â'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ððððððð ðð ðððððð*
ââ¯
â
ââ¤ â Este comando sÃ³ pode
â   ser usado em grupos.
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`
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
                'ð'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ððððððð ðð ðððððð*
ââ¯
â
ââ¤ ð Ainda nÃ£o existem
â   dados de XP neste grupo.
â
ââ¤ _Conversem para comeÃ§ar a
â   ganhar XP!_ â­
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`
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
                'ð¶'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ððððððð ðð ðððððð*
ââ¯
â
ââ¤ ð¶ Nenhum filho com XP
â   foi encontrado neste grupo.
â
ââ¤ _Adote alguÃ©m e participe
â   das conversas para aparecer!_ â­
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`
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
            'ð¥',
            'ð¥',
            'ð¥'
        ];

        let textoRanking =
            `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ððððððð ðð ðððððð*
ââ¯
â
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
                `${posicao}ï¸â£`;

            const mencao =
                `@${String(
                    filho.id
                ).split('@')[0]}`;

            idsMencao.push(
                filho.id
            );

            textoRanking +=
                `ââ¤ ${emojiPosicao} *${posicao}Âº* ${mencao}
â   â­ NÃ­vel *${filho.nivel}* â¢ *${filho.xp} XP*
â   ð¬ ${filho.mensagens} mensagem${filho.mensagens === 1 ? '' : 'ns'}
â
`;
        }

        textoRanking +=
            `âââââââââââââââââââ`;

        textoRanking +=
            `

ð¶ *Total de filhos no ranking:* ${filhos.length}`;

        textoRanking +=
            `

âââ¢âà¼ºð¶à¼»ââ¢ââ`;

        await reagir(
            message,
            'ð¶'
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
            'â Erro ao mostrar ranking de filhos:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            'â _Ocorreu um erro ao carregar o ranking de filhos._'
        );
    }
}

// ðï¸ MOSTRAR CONQUISTAS
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
                'â'
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
            `âââ¢âà¼ºðï¸à¼»ââ¢ââ
â   *ðï¸ ðððð ðððððððððð*
ââ¯
â
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
                    `ââ¤ ${conquista.emoji} *${conquista.nome}* â
â   _${conquista.descricao}_
â
`;
            }
        }

        if (
            desbloqueadas === 0
        ) {

            texto +=
                `ââ¤ ð _VocÃª ainda nÃ£o desbloqueou
â   nenhuma conquista._
â
`;
        }

        texto +=
            `âââââââââââââââââââ
â
â *ð CONQUISTAS BLOQUEADAS*
â
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
                    `ââ¤ ð ${conquista.emoji} *${conquista.nome}*
â   _${conquista.descricao}_
â
`;
            }
        }

        if (
            bloqueadas === 0
        ) {

            texto +=
                `ââ¤ ð _Todas as conquistas foram desbloqueadas!_
â
`;
        }

        texto +=
            `âââââââââââââââââââ
â
â ðï¸ *${desbloqueadas}/${listaConquistas.length}*
â   conquistas desbloqueadas.
â
âââ¢âà¼ºðï¸à¼»ââ¢ââ`;

        await reagir(
            message,
            'ðï¸'
        );

        await responderCitando(
            message,
            texto
        );

    } catch (erro) {

        console.error(
            'â Erro ao mostrar conquistas:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            'â _Ocorreu um erro ao carregar suas conquistas._'
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
                'â ï¸ NÃ£o foi possÃ­vel obter a mensagem citada.'
            );
        }
    }

    if (!mensagemAlvo.hasMedia) {
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â *ðððððð ððÌð ðððððððððð.*

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
                'MÃ­dia nÃ£o disponÃ­vel.'
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
            'â'
        );

    } catch (erro) {
        console.error(
            'â Erro ao criar figurinha:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `â *ððÌð ððð ðððððÌððð ððððð ð ððððððððð.*

_Se for uma imagem de visualizaÃ§Ã£o Ãºnica,_
_o WhatsApp pode nÃ£o disponibilizar a mÃ­dia_
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
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â *ðððððð ððÌð ðððððððððð.*

_Envie dois emojis separados por espaÃ§o:_

*${PREFIXO}emojimix ð ð*`
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
                'CombinaÃ§Ã£o nÃ£o encontrada.'
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

        await reagir(message, 'â');

    } catch (erro) {
        console.error(
            'â Erro ao combinar emojis:',
            erro
        );

        await reagir(message, 'â');

        await responderCitando(
            message,
            `â *ððÌð ððð ðððððÌððð ðððððððð.*

_Essa combinaÃ§Ã£o pode nÃ£o existir no_
_Emoji Kitchen. Tente outra dupla._`
        );
    }
}

// ============================================================
// BRAT
// ============================================================

// Renderizador BRAT baseado no mesmo princÃ­pio do gerador web:
// texto real medido pelo Chromium, alinhamento no canto superior esquerdo,
// Arial comum comprimida horizontalmente e blur aplicado no canvas.
async function renderizarBratNoNavegador(texto, opcoes = {}) {
    const pagina = client.pupPage;

    if (!pagina) {
        throw new Error('PÃ¡gina do navegador do WhatsApp ainda nÃ£o estÃ¡ disponÃ­vel.');
    }

    const resultado = await pagina.evaluate(async ({ texto, opcoes }) => {
        const canvas = document.createElement('canvas');
        const tamanho = 1000;
        const margem = 32;
        const larguraUtil = tamanho - (margem * 2);
        const alturaUtil = tamanho - (margem * 2);
        const escalaX = 0.69;
        // O gerador original usa textFit para encontrar o maior tamanho
        // que cabe dentro da caixa. Aqui reproduzimos essa ideia no canvas:
        // testamos os tamanhos por busca binÃ¡ria, usando largura + altura.
        const fonteMinima = 20;
        const fonteMaxima = opcoes.fonteMaxima || 475;
        const pesoFonte = opcoes.pesoFonte || 500;
        const desfoque = opcoes.desfoque ?? 7;
        const fundo = opcoes.fundo || '#ffffff';
        const corTexto = opcoes.corTexto || '#000000';
        const fonteForcada = opcoes.fonte;
        const lineHeightFator = 0.9;
        const cacheEmoji = new Map();

        canvas.width = tamanho;
        canvas.height = tamanho;

        const ctx = canvas.getContext('2d');
        const normalizarFonte = tamanhoFonte =>
            `${pesoFonte} ${tamanhoFonte}px \"Arial Narrow\", \"Liberation Sans Narrow\", Arial, Liberation Sans, sans-serif`;

        // O BRAT original usa uma tipografia condensada. Carregamos a fonte
        // antes das mediÃ§Ãµes para que a quebra de linha use a mesma mÃ©trica
        // que serÃ¡ usada no desenho. Isso evita casos como "TESTE BEM LEGAL"
        // virando uma palavra por linha quando ainda caberiam duas.
        try {
            await document.fonts.load(normalizarFonte(100));
        } catch (_) {
            // Se a fonte condensada nÃ£o estiver disponÃ­vel, o fallback acima
            // continua funcionando normalmente.
        }

        function pareceEmoji(cluster) {
            if (/^[0-9#*]\uFE0F?\u20E3$/.test(cluster)) return true;

            for (const caractere of cluster) {
                const codigo = caractere.codePointAt(0);
                if (
                    (codigo >= 0x1F000 && codigo <= 0x1FAFF) ||
                    (codigo >= 0x2300 && codigo <= 0x23FF) ||
                    (codigo >= 0x2600 && codigo <= 0x27BF) ||
                    (codigo >= 0x2934 && codigo <= 0x2935) ||
                    (codigo >= 0x2B00 && codigo <= 0x2BFF) ||
                    [0x00A9, 0x00AE, 0x203C, 0x2049, 0x2122, 0x2139, 0x3030, 0x303D, 0x3297, 0x3299].includes(codigo)
                ) {
                    return true;
                }
            }
            return false;
        }

        function codigoTwemoji(cluster) {
            const temZWJ = cluster.includes('\u200D');
            return Array.from(cluster)
                .map(caractere => caractere.codePointAt(0).toString(16))
                .filter(codigo => codigo !== 'fe0f' || temZWJ)
                .join('-');
        }

        async function carregarEmoji(cluster) {
            if (cacheEmoji.has(cluster)) return cacheEmoji.get(cluster);

            const promessa = new Promise(resolve => {
                const imagem = new Image();
                imagem.crossOrigin = 'anonymous';
                imagem.onload = () => resolve(imagem);
                imagem.onerror = () => resolve(null);
                imagem.src = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${codigoTwemoji(cluster)}.png`;
            });

            cacheEmoji.set(cluster, promessa);
            return promessa;
        }

        function segmentar(textoLinha) {
            if (typeof Intl.Segmenter === 'function') {
                const segmenter = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' });
                return Array.from(segmenter.segment(textoLinha), item => item.segment);
            }
            return Array.from(textoLinha);
        }

        async function prepararTokens(textoLinha, tamanhoFonte) {
            const tokens = [];
            for (const cluster of segmentar(textoLinha)) {
                if (pareceEmoji(cluster)) {
                    const imagem = await carregarEmoji(cluster);
                    if (imagem) {
                        tokens.push({ tipo: 'emoji', valor: cluster, imagem });
                        continue;
                    }
                }
                tokens.push({ tipo: 'texto', valor: cluster });
            }
            return tokens;
        }

        function medirToken(token, tamanhoFonte) {
            if (token.tipo === 'emoji') return tamanhoFonte * 1.08;
            ctx.font = normalizarFonte(tamanhoFonte);
            return ctx.measureText(token.valor).width * escalaX;
        }

        async function medirLinha(textoLinha, tamanhoFonte) {
            const tokens = await prepararTokens(textoLinha, tamanhoFonte);
            return {
                largura: tokens.reduce((total, token) => total + medirToken(token, tamanhoFonte), 0),
                tokens
            };
        }

        async function quebrar(textoLinha, tamanhoFonte) {
            const palavras = textoLinha.trim().split(/\s+/).filter(Boolean);
            if (!palavras.length) return [''];

            const linhas = [];
            let linhaAtual = '';

            for (const palavra of palavras) {
                const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
                const medidaTentativa = await medirLinha(tentativa, tamanhoFonte);

                if (medidaTentativa.largura <= larguraUtil) {
                    linhaAtual = tentativa;
                    continue;
                }

                if (linhaAtual) {
                    linhas.push(linhaAtual);
                    linhaAtual = '';
                }

                const medidaPalavra = await medirLinha(palavra, tamanhoFonte);
                if (medidaPalavra.largura <= larguraUtil) {
                    linhaAtual = palavra;
                    continue;
                }

                let parte = '';
                for (const caractere of segmentar(palavra)) {
                    const tentativaCaractere = parte + caractere;
                    const medidaCaractere = await medirLinha(tentativaCaractere, tamanhoFonte);
                    if (medidaCaractere.largura <= larguraUtil) {
                        parte = tentativaCaractere;
                    } else {
                        if (parte) linhas.push(parte);
                        parte = caractere;
                    }
                }
                linhaAtual = parte;
            }

            if (linhaAtual) linhas.push(linhaAtual);
            return linhas.length ? linhas : [''];
        }

        let fonte;
        let linhas;

        if (fonteForcada) {
            fonte = fonteForcada;
            linhas = await quebrar(texto, fonte);
        } else {
            // Equivalente ao comportamento do textFit do gerador HTML:
            // poucas palavras conseguem uma fonte maior; conforme o texto
            // ocupa mais linhas/largura, o maior tamanho possÃ­vel diminui.
            let baixo = fonteMinima;
            let alto = fonteMaxima;
            let melhorFonte = fonteMinima;
            let melhoresLinhas = await quebrar(texto, melhorFonte);

            while (baixo <= alto) {
                const candidata = Math.floor((baixo + alto) / 2);
                const linhasCandidatas = await quebrar(texto, candidata);
                const alturaCandidata = linhasCandidatas.length * candidata * lineHeightFator;
                const cabeNaCaixa = alturaCandidata <= alturaUtil;

                if (cabeNaCaixa) {
                    melhorFonte = candidata;
                    melhoresLinhas = linhasCandidatas;
                    baixo = candidata + 1;
                } else {
                    alto = candidata - 1;
                }
            }

            // MantÃ©m o mesmo ajuste de encaixe, mas deixa o resultado
            // ligeiramente menor para nÃ£o ocupar tanto espaÃ§o na figurinha.
            fonte = Math.max(fonteMinima, melhorFonte - 10);
            linhas = await quebrar(texto, fonte);
        }

        const alturaLinha = fonte * lineHeightFator;

        ctx.fillStyle = fundo;
        ctx.fillRect(0, 0, tamanho, tamanho);

        ctx.save();
        ctx.translate(margem, margem);
        ctx.scale(escalaX, 1);
        ctx.font = normalizarFonte(fonte);
        ctx.fillStyle = corTexto;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.filter = `blur(${desfoque}px)`;

        let y = 0;
        for (const linha of linhas) {
            const { tokens } = await medirLinha(linha, fonte);
            let x = 0;

            for (const token of tokens) {
                if (token.tipo === 'emoji') {
                    const tamanhoEmoji = fonte * 1.08 / escalaX;
                    ctx.drawImage(token.imagem, x, y + (fonte * 0.01), tamanhoEmoji, tamanhoEmoji);
                    x += tamanhoEmoji;
                } else {
                    ctx.fillText(token.valor, x, y);
                    ctx.font = normalizarFonte(fonte);
                    x += ctx.measureText(token.valor).width;
                }
            }

            y += alturaLinha;
        }
        ctx.restore();

        return {
            dataUrl: canvas.toDataURL('image/png'),
            fonte,
            linhas,
            alturaLinha,
            escalaX,
            margem
        };
    }, { texto: String(texto || ''), opcoes });

    const base64 = resultado.dataUrl.replace(/^data:image\/png;base64,/, '');

    return {
        buffer: Buffer.from(base64, 'base64'),
        layout: resultado
    };
}

async function gerarBrat1(message, argumento) {
    const texto = (argumento || '').trim();

    if (!texto) {
        await reagir(message, 'â');
        await responderCitando(
            message,
            `â *ððððð ððÌð ððððððððð.*\n\n_Exemplo:_\n\n*${PREFIXO}brat1 ola a todos*`
        );
        return;
    }

    try {
        const { buffer } = await renderizarBratNoNavegador(texto, {
            fundo: '#ffffff',
            corTexto: '#000000',
            desfoque: 7,
            pesoFonte: 500
        });

        const figurinha = new MessageMedia(
            'image/png',
            buffer.toString('base64'),
            'brat.png'
        );

        await client.sendMessage(message.from, figurinha, {
            sendMediaAsSticker: true
        });

        await reagir(message, 'â');
    } catch (erro) {
        console.error('â Erro ao gerar brat1:', erro);
        await reagir(message, 'â');
        await responderCitando(
            message,
            'â _NÃ£o foi possÃ­vel gerar a figurinha brat._'
        );
    }
}

// ============================================================
// BRAT 2
// ANIMAÃÃO PALAVRA POR PALAVRA
// ============================================================

async function gerarBrat2(message, argumento) {
    const texto = (argumento || '').trim();

    if (!texto) {
        await reagir(message, 'â');
        await responderCitando(
            message,
            `â *ððððð ððÌð ððððððððð.*\n\n_Exemplo:_\n\n*${PREFIXO}brat2 ola a todos*`
        );
        return;
    }

    try {
        const palavras = texto.split(/\s+/).filter(Boolean);

        // Calcula o tamanho uma Ãºnica vez usando o texto completo. Assim,
        // os frames nÃ£o ficam mudando de escala conforme as palavras entram.
        const layoutCompleto = await renderizarBratNoNavegador(texto, {
            fundo: '#ffffff',
            corTexto: '#000000',
            desfoque: 0,
            pesoFonte: 500
        });

        const frames = [[]];
        for (let i = 1; i <= palavras.length; i++) {
            frames.push(palavras.slice(0, i));
        }

        const encoder = new GIFEncoder(1000, 1000);
        encoder.start();
        encoder.setRepeat(0);
        encoder.setQuality(5);

        for (let i = 0; i < frames.length; i++) {
            const textoFrame = frames[i].join(' ');
            let bufferRgba;

            if (!textoFrame) {
                const vazio = await renderizarBratNoNavegador(' ', {
                    fundo: '#ffffff',
                    corTexto: '#000000',
                    desfoque: 0,
                    pesoFonte: 500,
                    fonte: layoutCompleto.layout.fonte
                });
                bufferRgba = await sharp(vazio.buffer)
                    .ensureAlpha()
                    .raw()
                    .toBuffer();
            } else {
                const frame = await renderizarBratNoNavegador(textoFrame, {
                    fundo: '#ffffff',
                    corTexto: '#000000',
                    desfoque: i === 0 ? 0 : 7,
                    pesoFonte: 500,
                    fonte: layoutCompleto.layout.fonte
                });
                bufferRgba = await sharp(frame.buffer)
                    .ensureAlpha()
                    .raw()
                    .toBuffer();
            }

            encoder.setDelay(i === 0 ? 250 : 400);
            encoder.addFrame(bufferRgba);
        }

        encoder.setDelay(1800);
        const final = await renderizarBratNoNavegador(texto, {
            fundo: '#ffffff',
            corTexto: '#000000',
            desfoque: 7,
            pesoFonte: 500,
            fonte: layoutCompleto.layout.fonte
        });
        const bufferFinal = await sharp(final.buffer)
            .ensureAlpha()
            .raw()
            .toBuffer();
        encoder.addFrame(bufferFinal);
        encoder.finish();

        const bufferGif = encoder.out.getData();
        const figurinhaAnimada = new MessageMedia(
            'image/gif',
            bufferGif.toString('base64'),
            'brat.gif'
        );

        await client.sendMessage(message.from, figurinhaAnimada, {
            sendMediaAsSticker: true
        });

        await reagir(message, 'â');
    } catch (erro) {
        console.error('â Erro ao gerar brat2:', erro);
        await reagir(message, 'â');
        await responderCitando(
            message,
            'â _NÃ£o foi possÃ­vel gerar a figurinha animada brat._'
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
                        'â ï¸ FFmpeg:',
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
                                `FFmpeg encerrou com cÃ³digo ${codigo}`
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
                            `FFmpeg terminou com cÃ³digo ${codigo}\n${erro}`
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
// TOCAR MÃSICA
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
            'â'
        );

        await responderCitando(
            message,
            `â *ððÌðððð ððÌð ððððððððð.*

_Exemplo:_

*${PREFIXO}playm nome da mÃºsica*`
        );

        return;
    }

    try {

        await reagir(
            message,
            'ð'
        );

        // ----------------------------------------------------
        // YOUTUBE / YT-DLP
        // PESQUISAR A MÃSICA
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
                'MÃºsica nÃ£o encontrada no YouTube.'
            );
        }

        // ----------------------------------------------------
        // INFORMAÃÃES
        // ----------------------------------------------------

        const titulo =
            video.title ||
            'NÃ£o informado';

        const artista =
            video.artist ||
            video.uploader ||
            video.channel ||
            'NÃ£o informado';

        let duracao =
            'NÃ£o informada';

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
        // CAPA DO VÃDEO
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
                    'â ï¸ Erro ao baixar thumbnail:',
                    erro.message
                );
            }
        }

        // ----------------------------------------------------
        // INFORMAÃÃES
        // ----------------------------------------------------

        const informacoes =
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ðµ ððÌðððð*
ââ¯
ââ¤ *ððÌðððð:*
â   _${titulo}_
â
ââ¤ *ððððððð:*
â   _${artista}_
â
ââ¤ *â±ï¸ ðððððÌ§ðÌð:*
â   _${duracao}_
â
ââ¤ *ð ððððð:*
â   _${views}_
â
ââ¤ ð *${urlVideo}*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`;

        // ----------------------------------------------------
        // ENVIAR CAPA + INFORMAÃÃES
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
        // ÃUDIO
        // ----------------------------------------------------

        await reagir(
            message,
            'â¬ï¸'
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
            // BAIXAR ÃUDIO ORIGINAL
            // ------------------------------------------------
            // O yt-dlp apenas baixa o Ã¡udio.
            // A conversÃ£o para MP3 serÃ¡ feita pelo
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
                    'Arquivo de Ã¡udio nÃ£o foi encontrado apÃ³s o download.'
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
                    'FFmpeg nÃ£o criou o arquivo MP3.'
                );
            }

            // ------------------------------------------------
            // ENVIAR ÃUDIO
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
                'ðµ'
            );

        } catch (erroAudio) {

            console.error(
                'â Erro ao processar Ã¡udio:',
                erroAudio
            );

            await responderCitando(
                message,
                `â *NÃO FOI POSSÃVEL PROCESSAR O ÃUDIO.*

_O conteÃºdo pode nÃ£o permitir download ou ocorreu um erro durante o processamento._`
            );

            await reagir(
                message,
                'â'
            );

        } finally {

            // ------------------------------------------------
            // LIMPAR ARQUIVOS TEMPORÃRIOS
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
                    'â ï¸ Erro ao limpar arquivos temporÃ¡rios:',
                    erroLimpeza.message
                );
            }
        }

    } catch (erro) {

        console.error(
            'â Erro no playm:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `â *ððÌð ððð ðððððÌððð ððððððððð ð ððÌðððð.*

_Tente pesquisar pelo nome completo da mÃºsica e artista._`
        );
    }
}

// ============================================================
// CONFIGURAÃÃES DO PLAYM
// ============================================================

const LIMITE_PREVIA_MINUTOS = 10;

// ============================================================
// TOCAR VÃDEO
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
            'â'
        );

        await responderCitando(
            message,
            `â *ððÌððð ððÌð ððððððððð.*

_Exemplo:_

*${PREFIXO}playv nome do vÃ­deo*`
        );

        return;
    }

    try {

        await reagir(
            message,
            'ð'
        );

        // ----------------------------------------------------
        // PESQUISAR VÃDEO
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
                'VÃ­deo nÃ£o encontrado no YouTube.'
            );
        }

        // ----------------------------------------------------
        // INFORMAÃÃES
        // ----------------------------------------------------

        const titulo =
            video.title ||
            'NÃ£o informado';

        const canal =
            video.uploader ||
            video.channel ||
            'NÃ£o informado';

        let duracao =
            'NÃ£o informada';

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
        // CAPA DO VÃDEO
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
                    'â ï¸ Erro ao baixar thumbnail:',
                    erro.message
                );
            }
        }

        // ----------------------------------------------------
        // INFORMAÃÃES
        // ----------------------------------------------------

        const informacoes =
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð¬ ððÌððð*
ââ¯
ââ¤ *ððÌðððð:*
â   _${titulo}_
â
ââ¤ *ððððð:*
â   _${canal}_
â
ââ¤ *â±ï¸ ðððððÌ§ðÌð:*
â   _${duracao}_
â
ââ¤ *ð ððððð:*
â   _${views}_
â
ââ¤ ð *${urlVideo}*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`;

        // ----------------------------------------------------
        // ENVIAR CAPA + INFORMAÃÃES
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
        // ÃUDIO/VÃDEO
        // ----------------------------------------------------

        await reagir(
            message,
            'â¬ï¸'
        );

        // ----------------------------------------------------
        // PASTA TEMPORÃRIA
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
            // BAIXAR VÃDEO
            // ------------------------------------------------
            // Preferimos MP4 atÃ© 720p quando disponÃ­vel.
            // NÃ£o usamos extractVideo nem pÃ³s-processamento
            // do yt-dlp. O FFmpeg farÃ¡ isso depois.
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
                    'Arquivo de vÃ­deo nÃ£o foi encontrado apÃ³s o download.'
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
            // MÃ¡ximo de 5 minutos.
            // Converte para MP4.
            // Redimensiona para no mÃ¡ximo 720p.
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

                                // Limite de duraÃ§Ã£o
                                '-t',
                                String(
                                    limiteSegundos
                                ),

                                // VÃ­deo
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

                                // Ãudio
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
                                        `FFmpeg terminou com cÃ³digo ${codigo}\n${erro}`
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
                    'FFmpeg nÃ£o criou o arquivo MP4.'
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
                `ð¬ VÃ­deo processado: ${tamanhoMB.toFixed(2)} MB`
            );

            // ------------------------------------------------
            // LIMITE DE SEGURANÃA
            // ------------------------------------------------

            const LIMITE_VIDEO_MB = 1000;

            if (
                tamanhoMB >
                LIMITE_VIDEO_MB
            ) {

                throw new Error(
                    `O vÃ­deo processado ficou muito grande (${tamanhoMB.toFixed(2)} MB).`
                );
            }

            // ------------------------------------------------
            // ENVIAR VÃDEO
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
                        `ð¬ *${titulo}*`
                }
            );

            await reagir(
                message,
                'ð¬'
            );

        } catch (erroVideo) {

            console.error(
                'â Erro ao processar vÃ­deo:',
                erroVideo
            );

            await responderCitando(
                message,
                `â *NÃO FOI POSSÃVEL PROCESSAR O VÃDEO.*

_O vÃ­deo pode nÃ£o estar disponÃ­vel para download, ser incompatÃ­vel ou ter ultrapassado o limite permitido._`
            );

            await reagir(
                message,
                'â'
            );

        } finally {

            // ------------------------------------------------
            // LIMPAR ARQUIVOS TEMPORÃRIOS
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
                    'â ï¸ Erro ao limpar arquivos temporÃ¡rios:',
                    erroLimpeza.message
                );
            }
        }

    } catch (erro) {

        console.error(
            'â Erro no playv:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `â *ððÌð ððð ðððððÌððð ððððððððð ð ððÌððð.*

_Tente pesquisar pelo nome completo do vÃ­deo._`
        );
    }
}

// ============================================================
// MODERAÃÃO
// ============================================================

async function banirPessoa(message) {
    try {
        if (!(await exigirAdmin(message))) return;

        const pessoa = await exigirPessoa(message);
        if (!pessoa) return;

        const idPessoa = idDaPessoa(pessoa);
        if (!idPessoa) {
            await reagir(message, 'â');
            await responderCitando(message, 'â _NÃ£o consegui identificar essa pessoa._');
            return;
        }

        const botId = client.info?.wid?._serialized || null;
        const idRemetente = obterIdRemetente(message);

        if (botId && idsIguais(idPessoa, botId)) {
            await reagir(message, 'ð¤¨');
            await responderCitando(message, 'ð¤¨ _Bonito. Tentando banir o prÃ³prio seguranÃ§a da festa._');
            return;
        }

        if (idRemetente && idsIguais(idPessoa, idRemetente)) {
            await reagir(message, 'ð¤¨');
            await responderCitando(message, 'ð¤¨ _VocÃª realmente tentou se expulsar do prÃ³prio grupo._');
            return;
        }

        // O message.getChat() usa Client.getChatById(), que estÃ¡ apresentando
        // o erro interno `r: r` em versÃµes recentes do WhatsApp Web.
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
                    `â ï¸ NÃ£o foi possÃ­vel acessar o grupo diretamente para o ban (tentativa ${tentativa}/3):`,
                    erroChat.message
                );

                if (tentativa < 3) {
                    await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
                }
            }
        }

        if (!dadosGrupo) {
            throw ultimoErroChat || new Error('NÃ£o foi possÃ­vel acessar o grupo.');
        }

        if (!dadosGrupo.isGroup) {
            await reagir(message, 'â');
            await responderCitando(message, 'â _Esse comando sÃ³ funciona em grupos._');
            return;
        }

        const participante = dadosGrupo.participants?.find(item => {
            return item.id && idsIguais(item.id, idPessoa);
        });

        if (participante?.isAdmin || participante?.isSuperAdmin) {
            await reagir(message, 'ð');
            await responderCitando(message, 'ð _Nem pensar. Administrador nÃ£o entra na fila da expulsÃ£o._');
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
                        throw new Error('O chat informado nÃ£o Ã© um grupo.');
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
                        throw new Error('A pessoa nÃ£o foi encontrada entre os participantes do grupo.');
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

        if (!removido) throw ultimoErro || new Error('O WhatsApp recusou a remoÃ§Ã£o.');

        await reagir(message, 'ð¨');
        await enviarComMencoes(
            message.from,
            `âââ¢âà¼ºð¨à¼»ââ¢ââ
â      *ððð ððððððððð*
ââ¯
â
ââ¤ ð¤ ${mencao} foi expulso(a) do grupo.
â
ââ¤ ð¨ _A democracia fez uma pausa._
ââ¤ ðª _A porta de saÃ­da estava logo ali._
ââ¤ ð­ _Volte quando o universo perdoar vocÃª._
â
âââ¢âà¼ºð¨à¼»ââ¢ââ`,
            { mentions: [idPessoa] }
        );
    } catch (erro) {
        console.error('â Erro ao banir pessoa:', erro);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui expulsar essa pessoa._\n\n_Confira se eu sou administrador do grupo e se a pessoa nÃ£o Ã© administradora._');
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
    // 1. TENTAR OBTER PESSOA POR MENÃÃO
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
    // 2. SE NÃO HOUVE MENÃÃO, VERIFICAR SE Ã UMA RESPOSTA
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
                    'ð ID DA PESSOA RESPONDIDA:',
                    idPessoa
                );
            }

        } catch (erro) {

            console.log(
                'â ï¸ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. NINGUÃM FOI ENCONTRADO
    // ============================================================

    if (!idPessoa) {

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ððððÌ§ðÌð ðð ððððð ððÌð ðððððððððð*
â
ââ¤ _Mencione alguÃ©m ou responda_
â   _Ã  mensagem da pessoa._
â
ââ¤ *ðððððððð:*
â
ââ¤ ${PREFIXO}mute @pessoa
ââ¤ Responda Ã  mensagem com ${PREFIXO}mute
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
        );

        return;
    }

    // ============================================================
    // 4. NÃO PERMITE MUTAR O PRÃPRIO BOT
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
            'ð¤¨'
        );

        await responderCitando(
            message,
            'ð¤¨ _Eu nÃ£o posso me mutar, nÃ©._'
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
    // 6. NOME / MENÃÃO
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
                'ðï¸ Mensagem do usuÃ¡rio mutado apagada.'
            );

        } catch (erro) {

            console.log(
                'â ï¸ NÃ£o foi possÃ­vel apagar a mensagem:',
                erro.message
            );
        }
    }

    // ============================================================
    // 8. REAÃÃO
    // ============================================================

    await reagir(
        message,
        'ð'
    );

    // ============================================================
    // 9. AVISO
    // ============================================================

    await enviarComMencoes(
        message.from,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð ðððð*
ââ¯
ââ¤ _${mencao} foi silenciado._
â
ââ¤ _As mensagens dessa pessoa_
â   _serÃ£o apagadas automaticamente._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
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
    // 1. TENTAR ENCONTRAR POR MENÃÃO
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
            'ð PESSOA MENCIONADA:',
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
                    'ð PESSOA RESPONDIDA:',
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
                'â ï¸ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. SE NÃO ENCONTROU NINGUÃM
    // ============================================================

    if (!idPessoa) {

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `â *PESSOA NÃO INFORMADA.*

Use uma menÃ§Ã£o ou responda Ã  mensagem da pessoa.

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
            'â ï¸'
        );

        await responderCitando(
            message,
            'â ï¸ _NÃ£o hÃ¡ ninguÃ©m mutado neste grupo._'
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
                'ð ID removido dos mutados:',
                id
            );
        }
    }

    // ============================================================
    // 7. VERIFICAR TAMBÃM PELO NÃMERO
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
                        'ð ID removido por nÃºmero:',
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
    // 8. PESSOA NÃO ESTAVA MUTADA
    // ============================================================

    if (!removido) {

        await reagir(
            message,
            'â ï¸'
        );

        await responderCitando(
            message,
            'â ï¸ _Essa pessoa nÃ£o estÃ¡ mutada neste grupo._'
        );

        return;
    }

    // ============================================================
    // 9. SALVAR ALTERAÃÃO
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
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð ðððððð*
ââ¯
ââ¤ _${mencao} foi desmutado._
â
ââ¤ _As mensagens dessa pessoa_
â   _nÃ£o serÃ£o mais apagadas._
â
âââ¢âà¼»ââ¢ââ`
    );
}

// ============================================================
// ð¢ TTG
// ============================================================

async function ttg(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;

    const texto = String(argumentos || '').trim();
    if (!texto) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºð¢à¼»ââ¢ââ\nâ      *ððð â¢ ðððððð ððððð*\nââ¯\nââ¤ â Informe a mensagem que serÃ¡ enviada.\nâ\nââ¤ ð¡ Exemplo:\nâ   *${obterPrefixoGrupo(message.from)}ttg atenÃ§Ã£o, pessoal!*\nâââ¢âà¼ºð¢à¼»ââ¢ââ`);
        return;
    }

    if (!message.from?.endsWith('@g.us')) {
        await responderCitando(message, 'â _O TTG sÃ³ funciona em grupos._');
        return;
    }

    try {
        const ids = await client.pupPage.evaluate((chatId) => {
            try {
                const Store = window.require('WAWebCollections');
                const chat = Store?.Chat?.get(chatId);
                const participantes = chat?.groupMetadata?.participants;
                if (!participantes) return { erro: 'Participantes do grupo nÃ£o encontrados.' };

                const modelos = typeof participantes.getModelsArray === 'function'
                    ? participantes.getModelsArray()
                    : (Array.isArray(participantes.models) ? participantes.models : []);

                return {
                    ids: modelos
                        .map(p => p?.id?._serialized || p?.id?.toString?.() || '')
                        .filter(Boolean)
                };
            } catch (erro) {
                return { erro: String(erro?.message || erro) };
            }
        }, message.from);

        if (ids?.erro) throw new Error(ids.erro);
        const botId = client.info?.wid?._serialized || '';
        const participantes = [...new Set((ids?.ids || []).filter(id => id && id !== botId))];

        if (!participantes.length) {
            await responderCitando(message, 'â ï¸ _NÃ£o encontrei participantes para mencionar._');
            return;
        }

        const corpo = `${texto}\n\n${participantes.map(id => `@${String(id).split('@')[0]}`).join(' ')}`;
        await enviarComMencoes(message.from, corpo, {
            mentions: participantes,
            quotedMessageId: obterIdMensagem(message)
        });
    } catch (erro) {
        console.error('â Erro no TTG:', erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ *ðððð ðð ððð*\nââ¯\nââ¤ _NÃ£o consegui obter os participantes deste grupo._\nââ¤ _${erro?.message || erro}_\nâââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

// ============================================================
// ð COMANDO DE CASAMENTO
// ============================================================

async function casarPessoa(
    message
) {

    let pessoa = null;
    let idPessoa = null;

    // ============================================================
    // 1. TENTAR ENCONTRAR POR MENÃÃO
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
            'ð PESSOA MARCADA:',
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
                    'ð PESSOA RESPONDIDA:',
                    idPessoa
                );
            }

        } catch (erro) {

            console.log(
                'â ï¸ Erro ao obter mensagem respondida:',
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
            'â'
        );

        await responderCitando(
            message,
            `â *ðððððð ððÌð ððððððððð.*

_Mencione alguÃ©m ou responda Ã  mensagem da pessoa._

_Exemplo:_

*${PREFIXO}casar @pessoa*`
        );

        return;
    }

    // ============================================================
    // 4. DESCOBRIR QUEM ESTÃ FAZENDO O PEDIDO
    // ============================================================

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {

        await reagir(
            message,
            'â'
        );

        return;
    }

    // ============================================================
    // 5. NÃO PODE CASAR CONSIGO MESMO
    // ============================================================

    if (
        idsIguais(
            idRemetente,
            idPessoa
        )
    ) {

        await reagir(
            message,
            'ð¤¨'
        );

        await responderCitando(
            message,
            'ð¤¨ _VocÃª nÃ£o pode pedir a si mesmo em casamento._'
        );

        return;
    }

    // ============================================================
    // 6. VERIFICAR SE O REMETENTE JÃ ESTÃ CASADO
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
            'ð'
        );

        await responderCitando(
            message,
            'ð _VocÃª jÃ¡ estÃ¡ casado. Primeiro precisa resolver seu casamento atual._'
        );

        return;
    }

    // ============================================================
    // 7. VERIFICAR SE A OUTRA PESSOA JÃ ESTÃ CASADA
    // ============================================================

    if (
        casamentos.has(
            idPessoa
        )
    ) {

        await reagir(
            message,
            'ð'
        );

        await responderCitando(
            message,
            'ð _Essa pessoa jÃ¡ estÃ¡ casada._'
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
            'ð'
        );

        await responderCitando(
            message,
            'ð _Essa pessoa jÃ¡ possui uma proposta de casamento pendente._'
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
        'ð'
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
            `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ðððððððð ðð ððððððððð*
ââ¯
ââ¤ ${mencaoRemetente}
â   _pediu ${mencaoPessoa} em casamento!_
â
ââ¤ ð ${mencaoPessoa}, vocÃª aceita?
â
ââ¤ *${PREFIXO}aceitar* ð
ââ¤ *${PREFIXO}recusar* ð
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
        mentions: [
            idRemetente,
            idPessoa
        ]
    }
);

}

async function divorcioPessoa(message) {
    const idRemetente = obterIdRemetente(message);

    // Procura o casamento do usuÃ¡rio
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

    // NÃ£o estÃ¡ casado
    if (!casamento) {
        await message.react('â');
        await message.reply(aplicarEstiloMensagem('ð VocÃª nÃ£o estÃ¡ casado com ninguÃ©m.'));
        return;
    }

    const idParceiro = casamento.parceiro;

    const mencaoRemetente = `@${idRemetente.split('@')[0]}`;
    const mencaoParceiro = `@${idParceiro.split('@')[0]}`;    
    
    // JÃ¡ existe uma confirmaÃ§Ã£o pendente
    if (confirmacoesDivorcio.has(chaveCasamento)) {
        await message.react('â ï¸');
        await message.reply(aplicarEstiloMensagem(
            'ð VocÃª jÃ¡ tem um divÃ³rcio aguardando confirmaÃ§Ã£o.\n\n' +
            'Use `;aceitar` para confirmar ou `;recusar` para cancelar.'
        ));
        return;
    }

    // Guarda a confirmaÃ§Ã£o
    confirmacoesDivorcio.set(chaveCasamento, {
        parceiro: idParceiro,
        grupo: message.from,
        data: new Date().toISOString()
    });

    await responderComMencoes(
    message,
    `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ðððÃðððð*
ââ¯
ââ¤ ${mencaoRemetente}
â   _solicitou o divÃ³rcio de ${mencaoParceiro}._
â
ââ¤ â ï¸ *VocÃª tem certeza?*
â
ââ¤ ð *${PREFIXO}aceitar* â Confirmar
ââ¤ â¤ï¸ *${PREFIXO}recusar* â Cancelar
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
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

    // Procura uma confirmaÃ§Ã£o de divÃ³rcio do usuÃ¡rio
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

    // NÃ£o existe divÃ³rcio aguardando confirmaÃ§Ã£o
    if (!confirmacao) {
        return false;
    }

    // SÃ³ pode confirmar no mesmo grupo onde iniciou
    if (confirmacao.grupo !== message.from) {
        return false;
    }

    const idParceiro = confirmacao.parceiro;

    // Procura a chave real do casamento do usuÃ¡rio
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

    // Remove a confirmaÃ§Ã£o
    confirmacoesDivorcio.delete(chaveConfirmacao);

    salvarCasamentos();

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    const mencaoParceiro =
        `@${idParceiro.split('@')[0]}`;

    await responderComMencoes(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ðððÃðððð ððððððÃðð*
ââ¯
ââ¤ ${mencaoRemetente}
â   _encerrou seu casamento com ${mencaoParceiro}._
â
ââ¤ ð¥ O casamento foi oficialmente encerrado.
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
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
        `âââ¢âà¼ºâ¤ï¸à¼»ââ¢ââ
â   *â¤ï¸ ðððÃðððð ððððððððð*
ââ¯
ââ¤ ${mencaoRemetente}
â   _decidiu permanecer casado com ${mencaoParceiro}._
â
ââ¤ ð O casamento continua intacto!
â
âââ¢âà¼ºâ¤ï¸à¼»ââ¢ââ`,
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
// ð¶ ADOTAR PESSOA
// ============================================================

async function adotarPessoa(message) {

    const idRemetente =
        obterIdRemetente(message);

    if (!idRemetente) {
        return;
    }

    // ============================================================
    // ð¤ ENCONTRAR PESSOA
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
    // â NENHUMA PESSOA ENCONTRADA
    // ============================================================

    if (!idPessoa) {

        await message.react('â');

        await message.reply(aplicarEstiloMensagem(
            `ð¶ Para adotar alguÃ©m, mencione a pessoa ou responda a uma mensagem dela.\n\n` +
            `Exemplo: *${PREFIXO}adotar @pessoa*`
        ));

        return;
    }

    // ============================================================
    // ð« NÃO PODE ADOTAR A SI MESMO
    // ============================================================

    if (
        idsIguais(
            idRemetente,
            idPessoa
        )
    ) {

        await message.react('â');

        await message.reply(aplicarEstiloMensagem(
            'â VocÃª nÃ£o pode adotar a si mesmo!'
        ));

        return;
    }

    // ============================================================
// ð NÃO PODE ADOTAR O PRÃPRIO CÃNJUGE
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

    await message.react('â');

    await message.reply(aplicarEstiloMensagem(
        'â VocÃª nÃ£o pode adotar seu par! (felizmente)'
    ));

    return;
}
    
    // ============================================================
    // ð VERIFICAR SE JÃ Ã FILHO
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

        await message.react('â ï¸');

        await message.reply(aplicarEstiloMensagem(
            'â ï¸ Essa pessoa jÃ¡ estÃ¡ registrada como seu filho!'
        ));

        return;
    }

    // ============================================================
    // ð VERIFICAR SE JÃ EXISTE PROPOSTA
    // ============================================================

    for (const proposta of propostasAdocao.values()) {

        if (
            idsIguais(
                proposta.para,
                idPessoa
            )
        ) {

            await message.react('â ï¸');

            await message.reply(aplicarEstiloMensagem(
                'â ï¸ Essa pessoa jÃ¡ recebeu uma proposta de adoÃ§Ã£o!'
            ));

            return;
        }
    }

    // ============================================================
    // ð¶ CRIAR PROPOSTA
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
    // ð¸ MENÃÃES
    // ============================================================

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    const mencaoPessoa =
        `@${idPessoa.split('@')[0]}`;

    // ============================================================
    // ð¶ MENSAGEM
    // ============================================================

    await responderComMencoes(
        message,
        `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ðððððððð ðð ðððÃÃð*
ââ¯
ââ¤ ${mencaoRemetente}
â   _quer adotar_ ${mencaoPessoa}!
â
ââ¤ ð­ ${mencaoPessoa}, vocÃª aceita?
â
ââ¤ â Responda *sim*
ââ¤ â Responda *nao*
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`,
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

    // NÃ£o existe proposta
    if (!proposta) {
        return false;
    }

    // ============================================================
    // ð VERIFICAR O GRUPO
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
    // ð¨âð©âð§ PEGAR FAMÃLIA DO PAI/MÃE
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
    // ð¶ PEGAR FAMÃLIA DO FILHO
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
    // ð EVITAR DUPLICAÃÃO
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
    // ð¾ SALVAR
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
    // ð¸ MENÃÃES
    // ============================================================

    const mencaoPaiMae =
        `@${idPaiMae.split('@')[0]}`;

    const mencaoFilho =
        `@${idFilho.split('@')[0]}`;

    // ============================================================
    // ð¶ ADOÃÃO REALIZADA
    // ============================================================

    await responderComMencoes(
        message,
        `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *ð¶ ðððÃÃð ððððððððð*
ââ¯
ââ¤ ${mencaoFilho}
â   _aceitou ser adotado por_ ${mencaoPaiMae}!
â
ââ¤ ð¨âð©âð§ Uma nova famÃ­lia foi formada!
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`,
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

    // NÃ£o existe proposta
    if (!proposta) {
        return false;
    }

    // ============================================================
    // ð VERIFICAR O GRUPO
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
    // â RECUSOU
    // ============================================================

    await responderComMencoes(
        message,
        `âââ¢âà¼ºð¶à¼»ââ¢ââ
â   *â ðððÃÃð ðððððððð*
ââ¯
ââ¤ @${idRemetente.split('@')[0]}
â   _recusou ser adotado por_ ${mencaoPaiMae}.
â
ââ¤ ð A adoÃ§Ã£o nÃ£o aconteceu.
â
âââ¢âà¼ºð¶à¼»ââ¢ââ`,
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
    // ð¨âð©âð§ PEGAR FAMÃLIA
    // ============================================================

    let familia =
        familias.get(idRemetente);

    // Caso ainda nÃ£o exista uma famÃ­lia
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
    // ð PEGAR CASAMENTO
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
    // ð MONTAR MENSAGEM
    // ============================================================

    const mencaoRemetente =
        `@${idRemetente.split('@')[0]}`;

    let textoFamilia =
        `âââ¢âà¼ºð¨âð©âð§à¼»ââ¢ââ
â   *ð¨âð©âð§ ððð ðððÃððð*
ââ¯
ââ¤ ð¤ VocÃª: ${mencaoRemetente}
â
`;

    const mencoes = [
        idRemetente
    ];

    // ============================================================
    // ð CASAMENTO
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
            `ââ¤ ð ${mencaoRemetente} Ã© casado com ${mencaoParceiro}\nâ\n`;

        mencoes.push(
            idParceiro
        );

    } else {

        textoFamilia +=
            `ââ¤ ð VocÃª nÃ£o estÃ¡ casado.\nâ\n`;
    }

    // ============================================================
    // ð¶ FILHOS
    // ============================================================

    textoFamilia +=
        `ââ¤ ð¶ *ðððððð*\n`;

    if (
        familia.filhos.length === 0
    ) {

        textoFamilia +=
            `â   ââ _Nenhum filho._\n`;

    } else {

        for (
            const idFilho
            of familia.filhos
        ) {

            const mencaoFilho =
                `@${idFilho.split('@')[0]}`;

            textoFamilia +=
                `â   ââ ${mencaoFilho}\n`;

            mencoes.push(
                idFilho
            );
        }
    }

    textoFamilia +=
        `â\n`;

    // ============================================================
    // ð¨âð©âð§ PAIS
    // ============================================================

    textoFamilia +=
        `ââ¤ ð¨âð©âð§ *ðððð / ðððððððÃðððð*\n`;

    if (
        familia.pais.length === 0
    ) {

        textoFamilia +=
            `â   ââ _Nenhum registrado._\n`;

    } else {

        for (
            const idPai
            of familia.pais
        ) {

            const mencaoPai =
                `@${idPai.split('@')[0]}`;

            textoFamilia +=
                `â   ââ ${mencaoPai}\n`;

            mencoes.push(
                idPai
            );
        }
    }

    textoFamilia +=
        `â\nâââ¢âà¼ºð¨âð©âð§à¼»ââ¢ââ`;

    // ============================================================
    // ð¸ FOTO DE QUEM FEZ O PEDIDO
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
                'â ï¸ NÃ£o foi possÃ­vel obter a foto de quem fez o pedido:',
                erro.message
            );
        }
    }

    // ============================================================
    // ð¤ ENVIAR FAMÃLIA
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
                'â ï¸ Erro ao enviar foto da famÃ­lia:',
                erro.message
            );
        }
    }

    // Caso nÃ£o tenha foto disponÃ­vel
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
// ð ACEITAR PROPOSTA DE CASAMENTO
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

    // Se nÃ£o encontrou, procura entre todas as propostas
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
            'â Nenhuma proposta encontrada para:',
            idRemetente
        );

        console.log(
            'ð PROPOSTAS ATUAIS:',
            [...propostasCasamento]
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            'â _VocÃª nÃ£o possui nenhuma proposta de casamento pendente._'
        );

        return;
    }

    // ============================================================
    // DADOS DO CASAMENTO
    // ============================================================

    const idPessoaQuePediu =
        proposta.de;

    // ============================================================
    // VERIFICAR SE ALGUM DOS DOIS JÃ ESTÃ CASADO
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
            'ð'
        );

        await responderCitando(
            message,
            'ð _NÃ£o foi possÃ­vel concluir o casamento porque uma das pessoas jÃ¡ estÃ¡ casada._'
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
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ððððððððð ððððððððð!*
ââ¯
ââ¤ ${mencaoPessoa} e ${mencaoParceiro}
â   _agora estÃ£o oficialmente casados!_ ð
â
ââ¤ ð Que comece a vida a dois!
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
        {
            mentions: [
                idRemetente,
                idPessoaQuePediu
            ]
        }
    );
}


// ============================================================
// ð RECUSAR PROPOSTA DE CASAMENTO
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

    // Se nÃ£o encontrou, procura entre todas as propostas
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
            'â Nenhuma proposta encontrada para:',
            idRemetente
        );

        console.log(
            'ð PROPOSTAS ATUAIS:',
            [...propostasCasamento]
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            'â _VocÃª nÃ£o possui nenhuma proposta de casamento pendente._'
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
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ðððððððð ðððððððð*
ââ¯
ââ¤ ${mencaoPessoa} recusou
â   _a proposta de ${mencaoParceiro}._
â
ââ¤ _Talvez na prÃ³xima..._ ð¥²
â
âââ¢âà¼»ââ¢ââ`,
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
    // ð¥ VERIFICAR SE Ã GRUPO
    // ============================================================

    if (
        !message.from.endsWith('@g.us')
    ) {

        await message.react('â');

        await message.reply(aplicarEstiloMensagem(
            'â Esse comando sÃ³ pode ser usado em grupos!'
        ));

        return;
    }

    // ============================================================
    // ð¥ PEGAR PARTICIPANTES REGISTRADOS
    // ============================================================

    const participantes =
        participantesGrupos.get(
            message.from
        );

    if (
        !participantes ||
        participantes.size < 2
    ) {

        await message.reply(aplicarEstiloMensagem(
            'â Ainda nÃ£o conheÃ§o pessoas suficientes desse grupo para formar um casal!\n\n' +
            'ð¡ PeÃ§a para pelo menos 2 pessoas enviarem uma mensagem primeiro.'
        ));

        return;
    }

    const pessoas =
        [...participantes];

    console.log(
        'ð PESSOAS DISPONÃVEIS PARA SORTEIO:',
        pessoas
    );

    // ============================================================
    // ð² ESCOLHER DUAS PESSOAS
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
    // ð PORCENTAGEM
    // ============================================================

    const porcentagem =
        Math.floor(
            Math.random() * 101
        );

    // ============================================================
    // ð MENÃÃES
    // ============================================================

    const mencao1 =
        `@${pessoa1.split('@')[0]}`;

    const mencao2 =
        `@${pessoa2.split('@')[0]}`;

    // ============================================================
    // ð RESULTADO
    // ============================================================

    await responderComMencoes(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ððððð ðð ððð*
ââ¯
ââ¤ ${mencao1} â¤ï¸ ${mencao2}
â
ââ¤ ð Compatibilidade: *${porcentagem}%*
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
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
    // ð VERIFICAR SE Ã GRUPO
    // ============================================================

    if (
        !message.from.endsWith('@g.us')
    ) {

        await message.react('â');

        await message.reply(aplicarEstiloMensagem(
            'â Esse comando sÃ³ pode ser usado em grupos!'
        ));

        return;
    }


    // ============================================================
    // ð¥ PEGAR AS PESSOAS MENCIONADAS
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
            console.log('â ï¸ Erro ao obter pessoa citada no ship:', erro.message);
        }
    }


    // ============================================================
    // â VERIFICAR QUANTIDADE
    // ============================================================

    if (
        pessoas.length !== 2
    ) {

        await message.reply(aplicarEstiloMensagem(
            'â VocÃª precisa mencionar exatamente 2 pessoas!\n\n' +
            'ð¡ Exemplo:\n' +
            '`;shipar`\n' +
            '@Pessoa1\n' +
            '@Pessoa2'
        ));

        return;
    }


    // ============================================================
    // ð« IMPEDIR SHIP CONSIGO MESMO
    // ============================================================

    if (
        pessoas[0] === pessoas[1]
    ) {

        await message.reply(aplicarEstiloMensagem(
            'â VocÃª nÃ£o pode shipar a mesma pessoa com ela mesma! ð'
        ));

        return;
    }


    // ============================================================
    // ð PORCENTAGEM
    // ============================================================

    const porcentagem =
        Math.floor(
            Math.random() * 101
        );


    // ============================================================
    // ð MENÃÃES
    // ============================================================

    const mencao1 =
        `@${pessoas[0].split('@')[0]}`;

    const mencao2 =
        `@${pessoas[1].split('@')[0]}`;


    // ============================================================
    // ð RESULTADO
    // ============================================================

    await responderComMencoes(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â   *ð ðððð ðð ððððð*
ââ¯
ââ¤ ${mencao1} â¤ï¸ ${mencao2}
â
ââ¤ ð Compatibilidade: *${porcentagem}%*
â
âââ¢âà¼ºðà¼»ââ¢ââ`,
        undefined,
        {
            mentions: pessoas
        }
    );
}

// ============================================================
// ð¤ SISTEMA AFK
// ============================================================

function obterChaveAFK(message, idUsuario) {

    return `${message.from}_${idUsuario}`;

}


// ============================================================
// â±ï¸ FORMATAR TEMPO DE AFK
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
// â±ï¸ FORMATAR TEMPO CURTO
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
// ð SAUDAÃÃO
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
// ð¤ OBTER ID DO USUÃRIO
// ============================================================

function obterIdAFK(message) {

    return (
        message.author ||
        message.from
    );

}


// ============================================================
// ð¤ ATIVAR AFK
// ============================================================

async function ativarAFK(
    message,
    motivo
) {

    // AFK sÃ³ funciona em grupos
    if (
        !message.from.endsWith('@g.us')
    ) {

        await responderCitando(
            message,
            `â­âââã ð¤ ðððð ððð ãââââ®
â
â â *DisponÃ­vel apenas em grupos*
â
â O modo AFK nÃ£o pode ser utilizado
â em conversas privadas.
â
â°âââââââââââââââââââââ¯`
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
    // ð JÃ ESTÃ AFK
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
            `â­âââã ð¤ ððð ððððð ãââââ®
â
â â ï¸ VocÃª jÃ¡ estava em AFK.
â
â ð *Motivo atualizado:*
â â _${dados.motivo}_
â
â°âââââââââââââââââââââ¯
ð¡ _Seu motivo foi atualizado com sucesso._`
        );

        return;

    }


    // ========================================================
    // ð¤ SALVAR AFK
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
    // ð¢ CONFIRMAÃÃO
    // ========================================================

    await responderCitando(
        message,
        `â­âââã ð¤ ððð ððððððð ãââââ®
â
â ð¤ *UsuÃ¡rio:* VocÃª
â ð *Motivo:* _${motivo || 'Sem motivo informado.'}_
â ð¤ *Status:* Ausente
â
â°âââââââââââââââââââââ¯

ð¡ _Envie qualquer mensagem para encerrar seu AFK._`
    );

}


// ============================================================
// ð REMOVER AFK
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
        'UsuÃ¡rio';


    try {

        const contato =
            await message.getContact();


        nome =
            contato.pushname ||
            contato.name ||
            contato.number ||
            'UsuÃ¡rio';

    } catch (erro) {

        console.log(
            'â ï¸ NÃ£o foi possÃ­vel obter nome do usuÃ¡rio AFK:',
            erro.message
        );

    }


    await responderCitando(
        message,
        `â­âââã ð ððð ððððððððð ãââââ®
â
â ð *${saudacao}, ${nome}!*
â
â â±ï¸ *Tempo ausente:*
â â ${tempo}
â
â ð *Motivo:*
â â _${dados.motivo}_
â
â â *Status:* Online
â
â°âââââââââââââââââââââ¯
_Que bom que vocÃª voltou! ð_`
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
    // 1. TENTAR ENCONTRAR POR MENÃÃO
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
            'ð« PESSOA MENCIONADA:',
            idPessoa
        );

        // Pega TODOS os IDs possÃ­veis da pessoa
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
                    'ð« PESSOA RESPONDIDA:',
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
                'â ï¸ Erro ao obter mensagem respondida:',
                erro.message
            );
        }
    }

    // ============================================================
    // 3. USAR NÃMERO INFORMADO MANUALMENTE
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
                'â'
            );

            await responderCitando(
                message,
                `â *ðððððð ððÌð ðððððððððððð.*

_Use uma menÃ§Ã£o, responda Ã  mensagem da pessoa ou informe o nÃºmero._

_Exemplos:_

*${PREFIXO}muteblacklist @pessoa*

ou responda Ã  mensagem com:

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
    // 4. GARANTIR QUE O ID PRINCIPAL TAMBÃM SEJA ADICIONADO
    // ============================================================

    if (idPessoa) {

        idsPessoa.add(
            idPessoa
        );
    }

    // ============================================================
    // 5. ADICIONAR TODOS OS IDs Ã BLACKLIST
    // ============================================================

    if (
        idsPessoa.size === 0
    ) {

        idsPessoa.add(
            idPessoa
        );
    }

    console.log(
        'ð« IDs DA PESSOA NA BLACKLIST:'
    );

    for (
        const id of idsPessoa
    ) {

        blacklistMute.add(
            id
        );

        console.log(
            '   ð«',
            id
        );
    }

    // ============================================================
    // 6. RESPOSTA
    // ============================================================

    await reagir(
        message,
        'ð«'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâ¿à¼»ââ¢ââ
â   *ð« ððððððððð*
ââ¯
ââ¤ _A pessoa foi adicionada Ã _
â   _lista negra de mute._
â
ââ¤ _Ela serÃ¡ silenciada em todos_
â   _os grupos onde o bot estiver._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
    );
}

// ============================================================
// ð COMANDO SUICÃDIO
// ============================================================

async function suicidio(message) {

    if (!message.from.endsWith('@g.us')) {

        await message.react('â');

        await message.reply(aplicarEstiloMensagem(
            'â Esse comando sÃ³ pode ser usado em grupos!'
        ));

        return;
    }

    const idUsuario =
        obterIdRemetente(message);

    if (!idUsuario) {

        await message.reply(aplicarEstiloMensagem(
            'â NÃ£o consegui identificar vocÃª!'
        ));

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
                                erro: 'Store.Chat nÃ£o encontrado.'
                            };
                        }

                        const chat =
                            Store.Chat.get(chatId);

                        if (!chat) {

                            return {
                                sucesso: false,
                                erro: 'Grupo nÃ£o encontrado.'
                            };
                        }

                        const participantes =
                            chat.groupMetadata?.participants;

                        if (!participantes) {

                            return {
                                sucesso: false,
                                erro: 'Participantes do grupo nÃ£o encontrados.'
                            };
                        }

                        // Verificar se o usuÃ¡rio realmente estÃ¡ no grupo
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
                                erro: 'UsuÃ¡rio nÃ£o encontrado no grupo.'
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
                'â ERRO AO LOCALIZAR USUÃRIO:',
                resultado?.erro
            );

            await message.reply(aplicarEstiloMensagem(
                'â NÃ£o consegui localizar vocÃª neste grupo.'
            ));

            return;
        }

        console.log(
            'ð USUÃRIO LOCALIZADO:',
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
                        erro: 'Grupo nÃ£o encontrado.'
                    };
                }

                const participantes =
                    chat.groupMetadata?.participants;

                if (!participantes) {
                    return {
                        sucesso: false,
                        erro: 'Participantes nÃ£o encontrados.'
                    };
                }

                let participante = null;

                // ð Procurar pelo ID do usuÃ¡rio
                if (
                    typeof participantes.get ===
                    'function'
                ) {

                    participante =
                        participantes.get(
                            idUsuario
                        );

                }

                // ð Caso nÃ£o encontre pelo ID direto
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
                            'Participante nÃ£o encontrado.'
                    };
                }

                const ModifyParticipants =
                    window.require(
                        'WAWebModifyParticipantsGroupAction'
                    );

                // ðª REMOVER O PARTICIPANTE
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
    'ðª RESULTADO DA REMOÃÃO:',
    JSON.stringify(
        remocao,
        null,
        2
    )
);

        // ========================================================
        // RESULTADO DA REMOÃÃO
        // ========================================================

        if (
            !remocao ||
            !remocao.sucesso
        ) {

            console.error(
                'â ERRO AO REMOVER:',
                remocao?.erro
            );

            await message.reply(aplicarEstiloMensagem(
                'â NÃ£o consegui te remover do grupo.\n\n' +
                'ð Verifique se o JUST BOT continua sendo administrador.'
            ));

            return;
        }

        // ========================================================
        // SUCESSO
        // ========================================================

        await message.reply(aplicarEstiloMensagem(
            'ð Mais um para lista!'
        ));

    } catch (erro) {

        console.error(
            'â ERRO NO COMANDO SUICIDIO:',
            erro
        );

        await message.reply(aplicarEstiloMensagem(
            'â Ocorreu um erro ao executar o comando.'
        ));
    }
}

// ============================================================
// ð MANDAR PIADA
// ============================================================

async function mandarPiada(message) {

    if (
        piadas.length === 0
    ) {

        await reagir(
            message,
            'ð'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ððÌð ððððð ðððððð!*
â
â  Use o futuro comando:
â  *${PREFIXO}addpiada*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ðð ðððð ððð*
â
ââ¤ ${piada}
â
âââ¢âà¼ºðà¼»ââ¢ââ`
    );
}

// ============================================================
// â ADICIONAR PIADA
// ============================================================

async function adicionarPiada(message, argumento) {

    const piada =
        argumento.trim();

    if (!piada) {

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððððððð ððððð*
â
ââ¤ VocÃª precisa escrever
â   uma piada depois do comando.
â
â  ð¡ Exemplo:
â  *${PREFIXO}addpiada Sua piada aqui*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    piadas.push(
        piada
    );

    salvarPiadas();

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ðððððððððð!*
â
ââ¤ ${piada}
â
ââ¤ ð Total de piadas:
â   *${piadas.length}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
    );
}

// ============================================================
// ð LISTAR PIADAS
// ============================================================

async function listarPiadas(message) {

    if (piadas.length === 0) {

        await reagir(
            message,
            'ð'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ðð ðððððð*
â
â  Ainda nÃ£o existem piadas
â  cadastradas no JUST BOT.
â
â  ð¡ Use:
â  *${PREFIXO}addpiada texto*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    let lista =
        `âââ¢âà¼ºðà¼»ââ¢ââ
â    *ððððð ðð ðððððð*
ââ¯
â
`;

    piadas.forEach(
        (piada, indice) => {

            lista +=
                `ââ¤ *${indice + 1}.* ${piada}\nâ\n`;
        }
    );

    lista +=
        `ââ¯
â
â  ð *Total:* ${piadas.length} piada${piadas.length === 1 ? '' : 's'}
â
âââ¢âà¼ºðà¼»ââ¢ââ`;

    await reagir(
        message,
        'ð'
    );

    await responderCitando(
        message,
        lista
    );
}

// ============================================================
// ðï¸ REMOVER PIADA
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
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððððð ððððð*
â
ââ¤ Informe o nÃºmero da piada
â   que deseja remover.
â
â  ð¡ Exemplo:
â  *${PREFIXO}removerpiada 3*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    if (
        numero < 1 ||
        numero > piadas.length
    ) {

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ððððÌðððð*
â
ââ¤ NÃ£o existe uma piada
â   com o nÃºmero *${numero}*.
â
â  ð Total atual:
â   *${piadas.length}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
        'ðï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ðððððððð!*
â
ââ¤ *${piadaRemovida}*
â
ââ¤ ð Piadas restantes:
â   *${piadas.length}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
    );
}

// ============================================================
// ðï¸ LIMPAR TODAS AS PIADAS
// ============================================================

async function limparPiadas(message) {

    if (piadas.length === 0) {

        await reagir(
            message,
            'ð'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððð ððÌ ððððð*
â
â  NÃ£o existem piadas
â  cadastradas para apagar.
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    await reagir(
        message,
        'â ï¸'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºâ ï¸à¼»ââ¢ââ
â
â  *ðððððð ðððððð*
â
ââ¤ VocÃª estÃ¡ prestes a apagar
â   *TODAS* as piadas cadastradas.
â
â  ð Total:
â   *${piadas.length} piada${piadas.length === 1 ? '' : 's'}*
â
â  *â ï¸ ðð¨ð¨ð ðÃ§Ã£ð¤ ð£Ã£ð¤ ð¥ð¤ðð ð¨ðð§ 
â ððð¨ðððð©ð ððªð©ð¤ð¢ðð©ðððð¢ðð£ð©ð.*
â
â  Para confirmar, responda:
â
â  *ðºð°ð´*
â
â  Para cancelar, responda:
â
â  *ðµÃð¶*
â
âââ¢âà¼ºâ ï¸à¼»ââ¢ââ`
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
// ð CARREGAR PIADAS DE ARQUIVO
// ============================================================

async function carregarPiadas(message) {

    if (!message.hasMedia) {

        await reagir(
            message,
            'ð'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ðððððððð ðððððð*
â
ââ¤ Envie um arquivo *.txt*
â   contendo uma piada por linha.
â
â  ð¡ Exemplo:
â
â  Piada nÃºmero 1
â  Piada nÃºmero 2
â  Piada nÃºmero 3
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    try {

        const midia =
            await message.downloadMedia();

        if (!midia) {
            throw new Error(
                'Arquivo nÃ£o disponÃ­vel.'
            );
        }

        if (
            midia.mimetype !==
            'text/plain'
        ) {

            await reagir(
                message,
                'â'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºâà¼»ââ¢ââ
â
â  *ððððððð ððððÌðððð*
â
ââ¤ O arquivo precisa ser
â   um *.txt*.
â
âââ¢âà¼ºâà¼»ââ¢ââ`
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
                'â'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððððððð ððððð*
â
ââ¤ Nenhuma piada foi
â   encontrada no arquivo.
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ðððððð ðððððððððð!*
â
ââ¤ ð¥ Adicionadas:
â   *${novasPiadas.length}*
â
ââ¤ ð Total agora:
â   *${piadas.length}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

    } catch (erro) {

        console.error(
            'â Erro ao carregar piadas:',
            erro
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ðððð ðð ðððððððð*
â
ââ¤ NÃ£o foi possÃ­vel ler
â   o arquivo de piadas.
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );
    }
}

// ============================================================
// ð COMANDO CANTADA
// ============================================================

async function mandarCantada(message) {

    const cantadasLeves = [

        'ð¹ VocÃª acredita em amor Ã  primeira vista ou eu preciso passar aqui de novo?',

        'ð VocÃª nÃ£o Ã© Google, mas tem tudo que eu estava procurando.',

        'â¨ Se beleza fosse tempo, vocÃª seria uma eternidade.',

        'ð¹ VocÃª tem mapa? Porque eu me perdi no seu sorriso.',

        'ð« Acho que meu Wi-Fi encontrou sua conexÃ£o.',

        'â¤ï¸ Eu nÃ£o sou fotÃ³grafo, mas consigo imaginar nÃ³s dois juntos.',

        'ð· Seu sorriso devia ser considerado patrimÃ´nio mundial.',

        'ð VocÃª nÃ£o Ã© estrela, mas conseguiu iluminar meu dia.'

    ];

    const cantadasAtrevidas = [

        'ð Eu ia fazer uma cantada inteligente, mas vocÃª me deixou sem raciocÃ­nio.',

        'ð¥ VocÃª sempre Ã© assim ou resolveu ficar irresistÃ­vel sÃ³ hoje?',

        'ð Se beleza desse cadeia, vocÃª jÃ¡ estaria cumprindo prisÃ£o perpÃ©tua.',

        'ð¥ Eu tinha uma cantada perfeita, mas esqueci quando te vi.',

        'ð VocÃª Ã© perigoso(a). Eu mal te conheÃ§o e jÃ¡ estou querendo te conhecer melhor.',

        'ð¥ Se eu ganhasse R$1 toda vez que pensei em vocÃª, jÃ¡ estaria rico.',

        'ð VocÃª tem certeza que nÃ£o Ã© golpe? Porque parece bom demais para ser verdade.',

        'ð¥ Acho que vocÃª acabou de transformar meu "oi" em interesse.'

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
            `ð ${mencaoDaPessoa(pessoa)}\n\n${cantada}`,
            undefined,
            { mentions: [idPessoa] }
        );
        return;
    }

    await message.reply(aplicarEstiloMensagem(cantada));
}


// ============================================================
// MENU JOGOS
// ============================================================
// ============================================================
// ð° SLOTS
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
            await reagir(message, 'â³');
            await responderCitando(message, `â³ _Sua mina ainda estÃ¡ sendo preparada._\n\nTente novamente em *${segundos}s*.`);
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
            minerio = 'Diamante'; emoji = 'ð'; valor = Math.floor(Math.random() * 501) + 500;
        } else if (sorte < 0.20) {
            minerio = 'Ouro'; emoji = 'ð¥'; valor = Math.floor(Math.random() * 151) + 250;
        } else if (sorte < 0.50) {
            minerio = 'Prata'; emoji = 'ð¥'; valor = Math.floor(Math.random() * 71) + 120;
        } else {
            minerio = 'CarvÃ£o'; emoji = 'ðª¨'; valor = Math.floor(Math.random() * 51) + 30;
        }

        if (temPicareta) valor = Math.floor(valor * 1.25);
        carteira.saldo += valor;
        carteira.mineracoes += 1;
        registrarTransacao('mineracao', null, usuarioId, valor, minerio);
        salvarMoedas();

        await reagir(message, emoji);
        await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ
ââ¯ *ðððððððÌ§ðÌð*
â
ââ¤ ${emoji} VocÃª encontrou *${minerio}*!
ââ¤ ðª Valor: *${formatarMoedas(valor)} moedas*
${temPicareta ? 'ââ¤ âï¸ Picareta ReforÃ§ada: *+25%*\n' : ''}â
ââ¤ ð° Saldo: *${formatarMoedas(carteira.saldo)} moedas*
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro na mineraÃ§Ã£o:', erro);
        await reagir(message, 'â');
    }
}

async function mostrarLoja(message) {
    let texto = `âââ¢âà¼ºðªà¼»ââ¢ââ
â      *ðððð ðððð ðððððð*
ââ¯
â
`;
    for (const [id, item] of Object.entries(ITENS_LOJA)) {
        texto += `ââ¤ ${item.emoji} *${id}* â *${formatarMoedas(item.preco)} ðª*\nâ   _${item.descricao}_\nâ\n`;
    }
    texto += `ââ¯
â
ââ¤ Comprar: *${PREFIXO}comprar <item>*
ââ¤ Exemplo: *${PREFIXO}comprar picareta*
â
âââ¢âà¼ºðªà¼»ââ¢ââ`;
    await reagir(message, 'ðª');
    await responderCitando(message, texto);
}

async function comprarItem(message, argumentos) {
    const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
    const escolha = String(argumentos || '').trim().toLowerCase().split(/\s+/)[0];
    const item = ITENS_LOJA[escolha];

    if (!item) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Item invÃ¡lido._ Use *${PREFIXO}loja* para ver os produtos.`);
        return;
    }

    const carteira = garantirCarteira(usuarioId);
    if (carteira.saldo < item.preco) {
        await reagir(message, 'ð¸');
        await responderCitando(message, `ð¸ _VocÃª precisa de *${formatarMoedas(item.preco)} moedas* para comprar ${item.emoji} ${item.nome}._\n\nSeu saldo: *${formatarMoedas(carteira.saldo)} moedas*.`);
        return;
    }

    carteira.saldo -= item.preco;
    adicionarItem(usuarioId, escolha);
    registrarTransacao('compra', usuarioId, null, item.preco, item.nome);
    salvarMoedas();

    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ðððððð ððððððððð!*
â
ââ¤ ${item.emoji} *${item.nome}*
ââ¤ ðª Pago: *${formatarMoedas(item.preco)} moedas*
ââ¤ ð¦ Quantidade: *${quantidadeItem(usuarioId, escolha)}x*
â
ââ¤ ð° Saldo: *${formatarMoedas(carteira.saldo)} moedas*
â
âââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function mostrarInventario(message) {
    const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
    garantirCarteira(usuarioId);
    let texto = `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ððð ðððððððÌððð*
â
`;
    for (const [id, item] of Object.entries(ITENS_LOJA)) {
        texto += `ââ¤ ${item.emoji} *${item.nome}*: ${quantidadeItem(usuarioId, id)}x\n`;
    }
    texto += `â
âââ¢âà¼ºðà¼»ââ¢ââ`;
    await reagir(message, 'ð');
    await responderCitando(message, texto);
}

async function mostrarSaldo(message) {
    try {
        const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
        if (!usuarioId) return;
        const carteira = garantirCarteira(usuarioId);
        salvarMoedas();
        await reagir(message, 'ð°');
        await responderCitando(message, `âââ¢âà¼ºð°à¼»ââ¢ââ
â       *ððð ððððð*
ââ¯
â
ââ¤ ðª *${formatarMoedas(carteira.saldo)} moedas*
â
ââ¤ âï¸ MineraÃ§Ãµes: *${carteira.mineracoes}*
ââ¤ ð¥· Roubos bem-sucedidos: *${carteira.roubosSucesso}*
â
ââ¤ âï¸ *${PREFIXO}minerar*
ââ¤ ðª *${PREFIXO}loja*
ââ¤ ð° *${PREFIXO}slots 100*
â
âââ¢âà¼ºð°à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro ao mostrar saldo:', erro);
    }
}

async function jogarSlots(message, argumento) {
    try {
        const usuarioId = await resolverIdEconomia(obterIdRemetente(message));
        const argumentoLimpo = String(argumento || '').trim();
        if (!usuarioId || !/^\d+$/.test(argumentoLimpo)) {
            await reagir(message, 'â');
            await responderCitando(message, `â _Informe uma aposta inteira vÃ¡lida._\n\nA aposta mÃ­nima Ã© *10 moedas*.\nExemplo: *${PREFIXO}slots 100*`);
            return;
        }

        const aposta = Number(argumentoLimpo);
        if (!Number.isSafeInteger(aposta) || aposta < 10) {
            await reagir(message, 'â');
            await responderCitando(message, `â _A aposta deve ser um nÃºmero inteiro entre *10* e *${formatarMoedas(Number.MAX_SAFE_INTEGER)}* moedas._`);
            return;
        }

        const carteira = garantirCarteira(usuarioId);
        if (aposta > carteira.saldo) {
            await reagir(message, 'ð¸');
            await responderCitando(message, `ð¸ _Saldo insuficiente._\n\nAposta: *${formatarMoedas(aposta)}*\nSaldo: *${formatarMoedas(carteira.saldo)}*`);
            return;
        }

        carteira.saldo -= aposta;
        registrarTransacao('slots_aposta', usuarioId, null, aposta, 'Aposta nos slots');

        const simbolos = ['ð','ð','ð','ð','â­','ð','7ï¸â£'];
        const rolos = [0,1,2].map(() => simbolos[Math.floor(Math.random() * simbolos.length)]);
        let multiplicador = 0;

        if (rolos.every(s => s === '7ï¸â£')) multiplicador = 50;
        else if (rolos.every(s => s === 'ð')) multiplicador = 25;
        else if (rolos.every(s => s === 'â­')) multiplicador = 15;
        else if (rolos.every(s => s === 'ð')) multiplicador = 10;
        else if (rolos.every(s => s === 'ð')) multiplicador = 7;
        else if (rolos.every(s => s === 'ð')) multiplicador = 5;
        else if (rolos.every(s => s === 'ð')) multiplicador = 3;
        else if (rolos[0] === rolos[1] || rolos[1] === rolos[2] || rolos[0] === rolos[2]) multiplicador = 2;

        const premio = aposta * multiplicador;
        if (!Number.isSafeInteger(premio)) {
            console.error('â PrÃªmio dos slots excedeu o limite seguro:', { aposta, multiplicador });
            carteira.saldo += aposta;
            historicoEconomia.pop();
            salvarMoedas();
            await reagir(message, 'â');
            await responderCitando(message, 'â _NÃ£o foi possÃ­vel processar essa aposta com seguranÃ§a. Suas moedas foram devolvidas._');
            return;
        }

        carteira.saldo += premio;
        if (premio > 0) {
            registrarTransacao('slots_premio', null, usuarioId, premio, `PrÃªmio dos slots: ${rolos.join(' ')}, ${multiplicador}x`);
        }
        salvarMoedas();

        await reagir(message, multiplicador ? 'ð' : 'ð°');
        await responderCitando(message, `âââ¢âà¼ºð°à¼»ââ¢ââ\nâ      *ðððð ððððð*\nââ¯\nâ\nâ      ${rolos.join(' â ')}\nâ\nââ¤ ð² Aposta: *${formatarMoedas(aposta)}*\nââ¤ ð Multiplicador: *${multiplicador}x*\nââ¤ ðª PrÃªmio: *${formatarMoedas(premio)}*\nââ¤ ð° Saldo: *${formatarMoedas(carteira.saldo)}*\nâ\nâââ¢âà¼ºð°à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro nos slots:', erro);
        await reagir(message, 'â');
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
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe um valor inteiro vÃ¡lido._\n\nExemplo: *${PREFIXO}doar 500 @fulano*`);
        return;
    }
    const valor = Number(valorTexto);

    if (!Number.isSafeInteger(valor) || valor <= 0) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe um valor vÃ¡lido._\n\nExemplo: *${PREFIXO}doar 500 @fulano*`);
        return;
    }

    if (idsIguais(remetente, destinatario)) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _VocÃª nÃ£o pode doar para si mesmo._');
        return;
    }

    const carteira = garantirCarteira(remetente);
    if (carteira.saldo < valor) {
        await reagir(message, 'ð¸');
        await responderCitando(message, `ð¸ _VocÃª nÃ£o possui moedas suficientes._\n\nSeu saldo: *${formatarMoedas(carteira.saldo)}*\nValor: *${formatarMoedas(valor)}*`);
        return;
    }

    const antesRemetente = carteira.saldo;
    if (!transferirMoedas(remetente, destinatario, valor, 'doacao', 'DoaÃ§Ã£o entre usuÃ¡rios')) return;
    const saldoDestinatario = garantirCarteira(destinatario).saldo;
    const hora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await reagir(message, 'ð¸');
    await responderCitando(message, `âââ¢âà¼ºð¸à¼»ââ¢ââ
â       *ððððððððððð ðð ððððÌ§ðÌð*
ââ¯
â
ââ¤ ð¤ De: *${mencaoDaPessoa(remetente)}*
ââ¤ ð Para: *${mencaoDaPessoa(pessoa)}*
ââ¤ ðª Valor: *${formatarMoedas(valor)} moedas*
â
ââ¤ ð° Saldo apÃ³s envio: *${formatarMoedas(antesRemetente - valor)}*
ââ¤ ð° Saldo do destinatÃ¡rio: *${formatarMoedas(saldoDestinatario)}*
ââ¤ ð HorÃ¡rio: *${hora}*
â
ââ¯ *ðððððððÌ§ðÌð ðððððððððð* â
âââ¢âà¼ºð¸à¼»ââ¢ââ`, { mentions: [remetente, destinatario] });
}

async function sortearMoedas(message, argumentos) {
    if (!(await exigirAdmin(message))) return;
    const valorTexto = String(argumentos || '').trim();
    if (!/^\d+$/.test(valorTexto)) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe um valor inteiro vÃ¡lido._\n\nExemplo: *${PREFIXO}sortearm 500*`);
        return;
    }
    const valor = Number(valorTexto);
    if (!Number.isSafeInteger(valor) || valor <= 0) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe o valor do sorteio._\n\nExemplo: *${PREFIXO}sortearm 500*`);
        return;
    }
    if (!message.from.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _Esse comando sÃ³ funciona em grupos._');
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
        await reagir(message, 'â');
        await responderCitando(message, `â _NÃ£o encontrei participantes elegÃ­veis para o sorteio._`);
        return;
    }

    const vencedorOriginal = dados.jogadores[Math.floor(Math.random() * dados.jogadores.length)];
    const vencedor = await resolverIdEconomia(vencedorOriginal);
    const carteira = garantirCarteira(vencedor);
    carteira.saldo += valor;
    registrarTransacao('sorteio_admin', null, vencedor, valor, `Sorteio realizado por administrador ${obterIdRemetente(message)}`);
    salvarMoedas();
    const hora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await reagir(message, 'ð');
    await enviarComMencoes(message.from, `âââ¢âà¼ºðà¼»ââ¢ââ
â       *ððððððð ðð ðððððð*
ââ¯
â
ââ¤ ð¯ O vencedor Ã© *${mencaoDaPessoa(vencedor)}*!
ââ¤ ðª PrÃªmio: *${formatarMoedas(valor)} moedas*
ââ¤ ð HorÃ¡rio: *${hora}*
â
ââ¤ ð Sorteio criado por um administrador.
ââ¤ ð° As moedas foram geradas pelo bot.
â
âââ¢âà¼ºðà¼»ââ¢ââ`, { mentions: [vencedor] });
}

async function rankingDinheiro(message) {
    if (!message.from.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _O ranking de moedas sÃ³ funciona em grupos._');
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

    let texto = `âââ¢âà¼ºðà¼»ââ¢ââ
â    *ððððððð ðð ðððððð*
ââ¯
â
`;
    const medalhas = ['ð¥','ð¥','ð¥'];
    lista.forEach((item, i) => {
        texto += `ââ¤ ${medalhas[i] || `${i+1}Âº`} *${mencaoDaPessoa(item.id)}* â *${formatarMoedas(item.saldo)} ðª*\n`;
    });
    texto += `â
ââ¤ ð Sua posiÃ§Ã£o: *${posicao > 0 ? `${posicao}Âº` : 'fora do ranking'}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`;
    await reagir(message, 'ð');
    await enviarComMencoes(message.from, texto, { mentions: lista.map(x => x.id) });
}

// ============================================================
// ð¥ BATATA QUENTE / ð« ROLETA RUSSA
// ============================================================

async function obterJogadoresParaEliminacao(message) {
    if (!message.from || !message.from.endsWith('@g.us')) {
        return { erro: 'Esse jogo sÃ³ pode ser usado em grupos.' };
    }

    try {
        const dados = await client.pupPage.evaluate(
            async (chatId, botId) => {
                try {
                    const Store = window.require('WAWebCollections');
                    const chat = Store.Chat.get(chatId);

                    if (!chat) {
                        return { erro: 'Grupo nÃ£o encontrado.' };
                    }

                    const participantes = chat.groupMetadata?.participants;
                    if (!participantes) {
                        return { erro: 'Participantes nÃ£o encontrados.' };
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
                erro: dados?.erro || 'NÃ£o consegui obter os participantes.'
            };
        }

        return { jogadores: dados.jogadores || [] };
    } catch (erro) {
        console.error('â Erro ao obter jogadores do jogo:', erro);
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
                        return { sucesso: false, erro: 'Grupo nÃ£o encontrado.' };
                    }

                    const participantes = chat.groupMetadata?.participants;
                    if (!participantes) {
                        return { sucesso: false, erro: 'Participantes nÃ£o encontrados.' };
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
                            erro: 'Participante nÃ£o encontrado.'
                        };
                    }

                    if (participante.isAdmin || participante.isSuperAdmin) {
                        return {
                            sucesso: false,
                            erro: 'O participante Ã© administrador.'
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
            erro: 'Resposta vazia da remoÃ§Ã£o.'
        };
    } catch (erro) {
        console.error('â Erro ao expulsar jogador:', erro);
        return {
            sucesso: false,
            erro: String(erro?.message || erro)
        };
    }
}

const TEMPO_BATATA_QUENTE = 15 * 1000;

function escolherAleatorioSeguro(lista) {
    if (!Array.isArray(lista) || lista.length === 0) return null;
    return lista[crypto.randomInt(0, lista.length)];
}

function limparJogoBatataQuente(chatId) {
    const jogo = jogosEliminacao.get(chatId);
    if (jogo?.timeout) clearTimeout(jogo.timeout);
    jogosEliminacao.delete(chatId);
}

async function explodirBatataQuente(chatId, jogo) {
    const atual = jogosEliminacao.get(chatId);

    if (!atual || atual !== jogo || atual.tipo !== 'batata') return;

    jogosEliminacao.delete(chatId);
    if (atual.timeout) clearTimeout(atual.timeout);

    const mensagemBase = {
        from: chatId
    };

    const mencao = `@${String(atual.jogador).split('@')[0]}`;

    await enviarComMencoes(
        chatId,
        `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ\nâ  *ðððððð ðððððð!*\nâ\nââ¤ â° *O tempo acabou!*\nââ¤ A batata explodiu na mÃ£o de *${mencao}*! ð¥\nâ\nââ¤ *${mencao} foi expulso do grupo!*\nâââ¢âà¼ºð¥à¼»ââ¢ââ`,
        { mentions: [atual.jogador] }
    );

    await new Promise(resolve => setTimeout(resolve, 1200));
    const remocao = await expulsarJogadorDoGrupo(mensagemBase, atual.jogador);

    if (!remocao.sucesso) {
        await enviarComMencoes(
            chatId,
            `â ï¸ A batata explodiu em @${String(atual.jogador).split('@')[0]}, mas nÃ£o consegui expulsÃ¡-lo.\n\nâ ${remocao.erro}`,
            { mentions: [atual.jogador] }
        );
    }
}

function iniciarTimerBatataQuente(chatId, jogo) {
    if (jogo.timeout) clearTimeout(jogo.timeout);

    jogo.expiraEm = Date.now() + TEMPO_BATATA_QUENTE;
    jogo.timeout = setTimeout(() => {
        explodirBatataQuente(chatId, jogo).catch(erro => {
            console.error('â ERRO AO EXPLODIR A BATATA QUENTE:', erro);
        });
    }, TEMPO_BATATA_QUENTE);
}

async function verificarParticipanteBatataQuente(message, idsDestino) {
    try {
        const ids = [...new Set((Array.isArray(idsDestino) ? idsDestino : [idsDestino])
            .filter(Boolean)
            .map(id => String(id)))];

        const resultado = await client.pupPage.evaluate(
            (chatId, idsBusca) => {
                try {
                    const Store = window.require('WAWebCollections');
                    const chat = Store.Chat.get(chatId);
                    const participantes = chat?.groupMetadata?.participants;

                    if (!participantes) {
                        return { erro: 'NÃ£o consegui obter os participantes do grupo.' };
                    }

                    let modelos = [];
                    if (typeof participantes.getModelsArray === 'function') {
                        modelos = participantes.getModelsArray();
                    } else if (Array.isArray(participantes.models)) {
                        modelos = participantes.models;
                    }

                    const buscas = new Set(idsBusca.map(id => String(id)));
                    const numerosBusca = new Set(
                        idsBusca.map(id => String(id).split('@')[0])
                    );

                    const participante = modelos.find(p => {
                        const id = String(
                            p.id?._serialized || p.id?.toString?.() || ''
                        );
                        const user = p.id?.user != null ? String(p.id.user) : '';
                        const numero = id.split('@')[0];

                        return (
                            buscas.has(id) ||
                            numerosBusca.has(numero) ||
                            (user && numerosBusca.has(user))
                        );
                    });

                    if (!participante) {
                        return { encontrado: false };
                    }

                    return {
                        encontrado: true,
                        id: participante.id?._serialized || participante.id?.toString?.() || null,
                        isAdmin: !!participante.isAdmin,
                        isSuperAdmin: !!participante.isSuperAdmin,
                        isMe: !!participante.isMe
                    };
                } catch (erro) {
                    return { erro: String(erro?.message || erro) };
                }
            },
            message.from,
            ids
        );

        if (!resultado) {
            return { erro: 'NÃ£o consegui verificar o participante.' };
        }

        return resultado;
    } catch (erro) {
        console.error('â Erro ao verificar participante da batata:', erro);
        return { erro: String(erro?.message || erro) };
    }
}

async function passarBatataQuente(message) {
    try {
        if (!message.from?.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, 'â A batata quente sÃ³ pode ser passada em grupos.');
            return;
        }

        const jogo = jogosEliminacao.get(message.from);

        if (!jogo || jogo.tipo !== 'batata') {
            await reagir(message, 'â');
            await responderCitando(message, `â NÃ£o existe uma *batata quente* em andamento neste grupo.\n\nð¥ Inicie com *${PREFIXO}batata*.`);
            return;
        }

        const remetente = obterIdRemetente(message);
        if (!idsIguais(remetente, jogo.jogador)) {
            await reagir(message, 'â');
            await responderCitando(
                message,
                `â A batata estÃ¡ com @${String(jogo.jogador).split('@')[0]}! Somente quem estÃ¡ segurando a batata pode usar *${PREFIXO}passar*.`,
                { mentions: [jogo.jogador] }
            );
            return;
        }

        const pessoa = await obterPessoaMarcada(message);
        const destino = pessoa ? obterIdDeMencao(pessoa) : null;

        if (!destino) {
            await reagir(message, 'â');
            await responderCitando(message, `ð¥ VocÃª precisa mencionar quem vai receber a batata.\n\nð¡ Exemplo: *${PREFIXO}passar @pessoa*`);
            return;
        }

        if (idsIguais(remetente, destino)) {
            await reagir(message, 'â');
            await responderCitando(message, 'â VocÃª nÃ£o pode passar a batata para vocÃª mesmo!');
            return;
        }

        const idsDestino = await obterIdsPessoa(pessoa);
        idsDestino.add(destino);

        const verificacaoDestino = await verificarParticipanteBatataQuente(
            message,
            [...idsDestino]
        );

        if (verificacaoDestino.erro) {
            await reagir(message, 'â');
            await responderCitando(message, `â ${verificacaoDestino.erro}`);
            return;
        }

        if (!verificacaoDestino.encontrado) {
            await reagir(message, 'â');
            await responderComMencoes(
                message,
                `â @${String(destino).split('@')[0]} nÃ£o Ã© um participante vÃ¡lido deste grupo.`,
                { mentions: [destino] }
            );
            return;
        }

        if (verificacaoDestino.isAdmin || verificacaoDestino.isSuperAdmin) {
            await reagir(message, 'â');
            await responderComMencoes(
                message,
                `â @${String(destino).split('@')[0]} Ã© administrador e nÃ£o pode receber a batata.\n_Administradores e o prÃ³prio bot nÃ£o participam._`,
                { mentions: [destino] }
            );
            return;
        }

        jogo.jogador = verificacaoDestino.id || destino;
        jogo.ultimaPassagemEm = Date.now();
        iniciarTimerBatataQuente(message.from, jogo);

        const segundos = Math.ceil(TEMPO_BATATA_QUENTE / 1000);
        await reagir(message, 'ð¥');
        await enviarComMencoes(
            message.from,
            `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ\nâ  *ðððððð ðððððð!*\nâ\nââ¤ ð¥ @${String(remetente).split('@')[0]} passou a batata para @${String(destino).split('@')[0]}!\nââ¤ â° *${segundos} segundos!*\nâ\nââ¤ _Passe antes que ela exploda!_ ð¥\nâââ¢âà¼ºð¥à¼»ââ¢ââ`,
            { mentions: [remetente, destino] }
        );
    } catch (erro) {
        console.error('â ERRO AO PASSAR BATATA QUENTE:', erro);
        await reagir(message, 'â');
        await responderCitando(message, 'â Ocorreu um erro ao passar a batata quente.');
    }
}

async function jogarBatataQuente(message) {
    try {
        if (!message.from?.endsWith('@g.us')) {
            await reagir(message, 'â');
            await responderCitando(message, 'â A batata quente sÃ³ pode ser jogada em grupos!');
            return;
        }

        if (!(await exigirAdmin(message))) {
            return;
        }

        if (jogosEliminacao.has(message.from)) {
            await reagir(message, 'â');
            await responderCitando(message, `ð¥ JÃ¡ existe uma *batata quente* ou outro jogo de eliminaÃ§Ã£o em andamento neste grupo.`);
            return;
        }

        const jogadores = await obterJogadoresParaEliminacao(message);
        if (jogadores.erro) {
            await reagir(message, 'â');
            await responderCitando(message, `â ${jogadores.erro}`);
            return;
        }

        if (jogadores.jogadores.length < 2) {
            await reagir(message, 'â');
            await responderCitando(message, 'â Preciso de pelo menos *2 participantes que nÃ£o sejam administradores* para jogar a batata quente!');
            return;
        }

        const inicial = escolherAleatorioSeguro(jogadores.jogadores);
        const jogo = {
            tipo: 'batata',
            jogador: inicial,
            criadoEm: Date.now(),
            ultimaPassagemEm: Date.now(),
            timeout: null
        };

        jogosEliminacao.set(message.from, jogo);
        iniciarTimerBatataQuente(message.from, jogo);

        const segundos = Math.ceil(TEMPO_BATATA_QUENTE / 1000);
        const mencao = `@${String(inicial).split('@')[0]}`;

        await reagir(message, 'ð¥');
        await enviarComMencoes(
            message.from,
            `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ\nâ  *ðððððð ðððððð!*\nâ\nââ¤ ð¥ A batata comeÃ§ou com *${mencao}*!\nââ¤ â° VocÃª tem *${segundos} segundos* para passar!\nâ\nââ¤ ð¡ Use *${PREFIXO}passar @pessoa*\nââ¤ â ï¸ Somente quem estÃ¡ com a batata pode passÃ¡-la.\nâ\nââ¤ _Se o tempo acabar, a batata explode!_ ð¥\nâââ¢âà¼ºð¥à¼»ââ¢ââ`,
            { mentions: [inicial] }
        );
    } catch (erro) {
        limparJogoBatataQuente(message.from);
        console.error('â ERRO NA BATATA QUENTE:', erro);
        await responderCitando(message, 'â Ocorreu um erro ao iniciar a batata quente.');
    }
}

async function jogarRoletaRussa(message) {
    try {
        if (!message.from.endsWith('@g.us')) {
            await reagir(message, 'â');
            await message.reply(aplicarEstiloMensagem('â A roleta russa sÃ³ pode ser usada em grupos!'));
            return;
        }

        if (!(await exigirAdmin(message))) {
            return;
        }

        if (jogosEliminacao.has(message.from)) {
            await reagir(message, 'â');
            await message.reply(aplicarEstiloMensagem('â JÃ¡ existe um jogo de eliminaÃ§Ã£o em andamento neste grupo.'));
            return;
        }

        const jogadores = await obterJogadoresParaEliminacao(message);
        if (jogadores.erro) {
            await reagir(message, 'â');
            await message.reply(aplicarEstiloMensagem(`â ${jogadores.erro}`));
            return;
        }

        if (jogadores.jogadores.length < 2) {
            await reagir(message, 'â');
            await message.reply(aplicarEstiloMensagem('â Preciso de pelo menos *2 participantes que nÃ£o sejam administradores* para girar a roleta russa!'));
            return;
        }

        const azarado = escolherAleatorioSeguro(jogadores.jogadores);
        jogosEliminacao.set(message.from, {
            tipo: 'rr',
            jogador: azarado,
            criadoEm: Date.now()
        });

        const mencao = `@${String(azarado).split('@')[0]}`;

        await reagir(message, 'ð«');
        await enviarComMencoes(
            message.from,
            `âââ¢âà¼ºð«à¼»ââ¢ââ\nâ\nâ  *ðððððð ððððð!*\nâ\nââ¤ A roleta girou... ð\nââ¤ O destino escolheu *${mencao}*! ð\nâ\nââ¤ *${mencao} foi expulso do grupo!*\nâââ¢âà¼ºð«à¼»ââ¢ââ`,
            { mentions: [azarado] }
        );

        await new Promise(resolve => setTimeout(resolve, 1200));
        const remocao = await expulsarJogadorDoGrupo(message, azarado);
        jogosEliminacao.delete(message.from);

        if (!remocao.sucesso) {
            await enviarComMencoes(
                message.from,
                `â ï¸ A roleta escolheu @${String(azarado).split('@')[0]}, mas nÃ£o consegui expulsÃ¡-lo.\n\nâ ${remocao.erro}`,
                { mentions: [azarado] }
            );
        }
    } catch (erro) {
        jogosEliminacao.delete(message.from);
        console.error('â ERRO NA ROLETA RUSSA:', erro);
        await message.reply(aplicarEstiloMensagem('â Ocorreu um erro ao girar a roleta russa.'));
    }
}


// ============================================================
// ðª¢ FORCA
// ============================================================

const PALAVRAS_FORCA = [
    'abacaxi', 'aviÃ£o', 'banana', 'bicicleta', 'borboleta',
    'cachorro', 'cavalo', 'computador', 'chocolate', 'dinossauro',
    'elefante', 'escola', 'espelho', 'foguete', 'floresta',
    'girafa', 'hamburguer', 'jacarÃ©', 'janela', 'lÃ¡pis',
    'macaco', 'montanha', 'navio', 'oceano', 'pipoca',
    'pirata', 'planeta', 'queijo', 'sorvete', 'telefone',
    'tigre', 'universo', 'vampiro', 'violÃ£o', 'zebra',
    'castelo', 'dragÃ£o', 'tesouro', 'robÃ´', 'futebol',
    'morcego', 'astronauta', 'chave', 'geladeira', 'televisÃ£o',
    'travesseiro', 'dinheiro', 'amizade', 'aventura', 'tempestade'
];

const LETRAS_STOP = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V'];
const CATEGORIAS_STOP = ['Nome', 'Animal', 'Comida', 'Lugar', 'Objeto'];
const TEMPO_STOP = 60 * 1000;
const MAX_ERROS_FORCA = 6;

function normalizarJogoTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function formatarPalavraForca(jogo) {
    return Array.from(jogo.palavra)
        .map(letra => {
            const chave = normalizarJogoTexto(letra);
            return jogo.descobertas.has(chave) ? letra.toUpperCase() : 'ï¼¿';
        })
        .join(' ');
}

function limparJogoForca(chatId) {
    jogosForca.delete(chatId);
}

async function iniciarForca(message) {
    const chatId = message?.from;
    if (!chatId?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðª¢à¼»ââ¢ââ\nââ¯ *ððððð*\nâ\nââ¤ â _Esse jogo sÃ³ funciona em grupos._\nâââ¢âà¼ºðª¢à¼»ââ¢ââ`);
        return;
    }

    if (jogosForca.has(chatId)) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðª¢à¼»ââ¢ââ\nââ¯ *ððððð ðð ððððððððð*\nâ\nââ¤ â ï¸ JÃ¡ existe uma rodada ativa.\nââ¤ ð Um admin pode usar *${PREFIXO}revforca*.\nâââ¢âà¼ºðª¢à¼»ââ¢ââ`);
        return;
    }

    const palavra = escolherAleatorioSeguro(PALAVRAS_FORCA);
    const jogo = {
        palavra,
        descobertas: new Set(),
        erros: new Set(),
        criadoEm: Date.now()
    };
    jogosForca.set(chatId, jogo);

    await reagir(message, 'ðª¢');
    await responderCitando(
        message,
        `âââ¢âà¼ºðª¢à¼»ââ¢ââ\nâ\nâ      *ððððð*\nâ\nââ¤ ð¤ Palavra: *${formatarPalavraForca(jogo)}*\nââ¤ â¤ï¸ Erros restantes: *${MAX_ERROS_FORCA}*\nâ\nââ¤ ð¡ Use *${PREFIXO}forca letra* para chutar uma letra.\nââ¤ ð¯ VocÃª tambÃ©m pode tentar a palavra inteira.\nâ\nââ¤ _Boa sorte!_ ð\nâââ¢âà¼ºðª¢à¼»ââ¢ââ`
    );
}

async function jogarForca(message, argumentos = '') {
    const chatId = message?.from;
    if (!chatId?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðª¢à¼»ââ¢ââ\nââ¯ *ððððð*\nâ\nââ¤ â _Esse jogo sÃ³ funciona em grupos._\nâââ¢âà¼ºðª¢à¼»ââ¢ââ`);
        return;
    }

    const entrada = String(argumentos || '').trim();
    if (!entrada) {
        await iniciarForca(message);
        return;
    }

    const jogo = jogosForca.get(chatId);
    if (!jogo) {
        await reagir(message, 'â');
        await responderCitando(message, `â NÃ£o existe uma forca em andamento. Use *${PREFIXO}forca* para comeÃ§ar.`);
        return;
    }

    const tentativa = normalizarJogoTexto(entrada);
    if (!tentativa) return;

    if (tentativa.length > 1) {
        if (tentativa === normalizarJogoTexto(jogo.palavra)) {
            limparJogoForca(chatId);
            await reagir(message, 'ð');
            await responderCitando(message, `ð *${obterNomeRemetente(message)}* acertou a palavra!\n\nðª¢ A palavra era: *${jogo.palavra.toUpperCase()}*`);
            return;
        }

        jogo.erros.add(tentativa);
    } else {
        if (!/^[a-z]$/i.test(tentativa)) {
            await responderCitando(message, 'â Envie apenas uma letra ou tente a palavra inteira.');
            return;
        }

        if (jogo.descobertas.has(tentativa) || jogo.erros.has(tentativa)) {
            await responderCitando(message, `â ï¸ A letra *${tentativa.toUpperCase()}* jÃ¡ foi tentada.`);
            return;
        }

        const existe = Array.from(normalizarJogoTexto(jogo.palavra)).includes(tentativa);
        if (existe) jogo.descobertas.add(tentativa);
        else jogo.erros.add(tentativa);
    }

    const palavraNormalizada = normalizarJogoTexto(jogo.palavra);
    const venceu = Array.from(new Set(Array.from(palavraNormalizada).filter(letra => /[a-z]/.test(letra))))
        .every(letra => jogo.descobertas.has(letra));

    if (venceu) {
        limparJogoForca(chatId);
        await reagir(message, 'ð');
        await responderCitando(message, `ð *${obterNomeRemetente(message)}* completou a forca!\n\nðª¢ Palavra: *${jogo.palavra.toUpperCase()}*`);
        return;
    }

    if (jogo.erros.size >= MAX_ERROS_FORCA) {
        limparJogoForca(chatId);
        await reagir(message, 'ð');
        await responderCitando(message, `ð *Fim de jogo!*\n\nðª¢ A palavra era: *${jogo.palavra.toUpperCase()}*\nâ Erros: *${[...jogo.erros].join(', ').toUpperCase()}*`);
        return;
    }

    await reagir(message, tentativa.length === 1 && jogo.descobertas.has(tentativa) ? 'â' : 'â');
    await responderCitando(
        message,
        `ðª¢ *FORCA*\n\nð¤ ${formatarPalavraForca(jogo)}\nâ¤ï¸ Erros restantes: *${MAX_ERROS_FORCA - jogo.erros.size}*\nâ Letras erradas: *${jogo.erros.size ? [...jogo.erros].join(', ').toUpperCase() : 'nenhuma'}*`
    );
}

async function revelarForca(message) {
    if (!(await exigirAdmin(message))) return;

    const jogo = jogosForca.get(message.from);
    if (!jogo) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ððððððð ððððð*\nâ\nââ¤ â _NÃ£o existe uma rodada ativa._\nâââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }

    limparJogoForca(message.from);
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððð ðððððððð*\nâ\nââ¤ ð _Um administrador encerrou a rodada._\nââ¤ ðª¢ Palavra: *${jogo.palavra.toUpperCase()}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

// ============================================================
// ð STOP
// ============================================================

function limparJogoStop(chatId) {
    const jogo = jogosStop.get(chatId);
    if (jogo?.timeout) clearTimeout(jogo.timeout);
    jogosStop.delete(chatId);
}

function pontuarStop(respostas) {
    const pontos = {};
    const ids = Object.keys(respostas);

    for (const id of ids) pontos[id] = 0;

    for (let indice = 0; indice < CATEGORIAS_STOP.length; indice++) {
        const categoria = CATEGORIAS_STOP[indice];
        const valores = ids.map(id => ({
            id,
            valor: String(respostas[id]?.[indice] || '').trim()
        })).filter(item => item.valor);

        const validos = valores.filter(item =>
            normalizarJogoTexto(item.valor).startsWith(normalizarJogoTexto(respostas._letra))
        );

        const contagem = new Map();
        for (const item of validos) {
            const chave = normalizarJogoTexto(item.valor);
            contagem.set(chave, (contagem.get(chave) || 0) + 1);
        }

        for (const item of validos) {
            const chave = normalizarJogoTexto(item.valor);
            pontos[item.id] += contagem.get(chave) > 1 ? 5 : 10;
        }
    }

    return pontos;
}

async function finalizarStop(chatId, motivo = 'tempo') {
    const jogo = jogosStop.get(chatId);
    if (!jogo) return;

    if (jogo.timeout) clearTimeout(jogo.timeout);
    jogosStop.delete(chatId);

    const respostas = { ...jogo.respostas, _letra: jogo.letra };
    const pontos = pontuarStop(respostas);
    const ranking = Object.keys(pontos).sort((a, b) => pontos[b] - pontos[a]);

    let texto = `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ðððð!*\nâ\nââ¤ ð¤ Letra: *${jogo.letra}*\nââ¤ ${motivo === 'manual' ? 'ð O jogo foi encerrado.' : 'â° O tempo acabou!'}\nâ\n`;

    if (!ranking.length) {
        texto += 'ââ¤ ð¶ NinguÃ©m enviou respostas.\n';
    } else {
        ranking.forEach((id, indice) => {
            texto += `ââ¤ ${indice === 0 ? 'ð¥' : indice === 1 ? 'ð¥' : indice === 2 ? 'ð¥' : 'ð'} @${String(id).split('@')[0]} â *${pontos[id]} pontos*\n`;
        });
    }

    texto += 'â\nââ¤ ð Respostas:\n';
    for (const id of ranking) {
        const respostasPessoa = jogo.respostas[id] || [];
        texto += `â\nâ @${String(id).split('@')[0]}\n`;
        CATEGORIAS_STOP.forEach((categoria, indice) => {
            texto += `â   ${categoria}: *${respostasPessoa[indice] || 'sem resposta'}*\n`;
        });
    }
    texto += 'â\nâââ¢âà¼ºðà¼»ââ¢ââ';

    await enviarComMencoes(chatId, texto, { mentions: ranking });
}

async function jogarStop(message, argumentos = '') {
    const chatId = message?.from;
    if (!chatId?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ðððð*\nâ\nââ¤ â _Esse jogo sÃ³ funciona em grupos._\nâââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }

    const entrada = String(argumentos || '').trim();
    const atual = jogosStop.get(chatId);

    if (!atual) {
        if (entrada && normalizarJogoTexto(entrada) !== 'iniciar') {
            await responderCitando(message, `â NÃ£o existe um STOP em andamento. Use *${PREFIXO}stop* para comeÃ§ar.`);
            return;
        }

        const letra = escolherAleatorioSeguro(LETRAS_STOP);
        const jogo = {
            letra,
            respostas: {},
            iniciadoEm: Date.now(),
            timeout: null
        };
        jogosStop.set(chatId, jogo);
        jogo.timeout = setTimeout(() => {
            finalizarStop(chatId).catch(erro => console.error('â ERRO AO FINALIZAR STOP:', erro));
        }, TEMPO_STOP);

        await reagir(message, 'ð');
        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ðððð!*\nâ\nââ¤ ð¤ Letra sorteada: *${letra}*\nââ¤ â° Tempo: *60 segundos*\nâ\nââ¤ ð Categorias:\nâ   1. Nome\nâ   2. Animal\nâ   3. Comida\nâ   4. Lugar\nâ   5. Objeto\nâ\nââ¤ ð¡ Responda assim:\nâ *${PREFIXO}stop JoÃ£o | JacarÃ© | Jaca | JapÃ£o | Janela*\nâ\nââ¤ ð Um admin pode encerrar usando *${PREFIXO}stop parar*.\nâââ¢âà¼ºðà¼»ââ¢ââ`
        );
        return;
    }

    if (normalizarJogoTexto(entrada) === 'parar') {
        if (!(await exigirAdmin(message))) return;
        await finalizarStop(chatId, 'manual');
        return;
    }

    const respostas = entrada.split('|').map(item => item.trim());
    if (respostas.length !== CATEGORIAS_STOP.length) {
        await responderCitando(message, `â Envie exatamente *${CATEGORIAS_STOP.length} respostas*, separadas por |.\n\nExemplo: *${PREFIXO}stop JoÃ£o | JacarÃ© | Jaca | JapÃ£o | Janela*`);
        return;
    }

    const id = obterIdRemetente(message);
    atual.respostas[id] = respostas;
    await reagir(message, 'ð');
    await responderCitando(message, `â Suas respostas foram registradas! Aguarde o fim do STOP.\n\nð¤ Letra: *${atual.letra}*`);
}

// ============================================================
// ð GRUPO: SOMENTE ADM / TODOS
// ============================================================

async function configurarGrupoMensagens(message, argumentos = '') {
    if (!message?.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ððððððð ðð ððððð*\nâ\nââ¤ â _Esse comando sÃ³ funciona em grupos._\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }

    if (!(await exigirAdmin(message))) return;

    const modo = String(argumentos || '').trim().toLowerCase();
    if (!['f', 'a'].includes(modo)) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ\nâ      *ðððððððð ðð ððððð*\nâ\nââ¤ ð *${PREFIXO}gp f*\nâ   _Somente administradores podem falar._\nâ\nââ¤ ð *${PREFIXO}gp a*\nâ   _Todos podem falar novamente._\nâ\nâââ¢âà¼ºâï¸à¼»ââ¢ââ`);
        return;
    }

    try {
        const somenteAdmins = modo === 'f';
        const resultado = await client.pupPage.evaluate(
            async (chatId, adminsOnly) => {
                try {
                    const chat = await window.WWebJS.getChat(chatId, {
                        getAsModel: false
                    });

                    if (!chat) {
                        return { sucesso: false, erro: 'grupo nÃ£o encontrado' };
                    }

                    const GroupAction = window.require('WAWebSetPropertyGroupAction');
                    if (!GroupAction?.setGroupProperty) {
                        return { sucesso: false, erro: 'aÃ§Ã£o do grupo indisponÃ­vel' };
                    }

                    await GroupAction.setGroupProperty(
                        chat,
                        'announcement',
                        adminsOnly ? 1 : 0
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
            somenteAdmins
        );

        if (!resultado?.sucesso) {
            throw new Error(resultado?.erro || 'O WhatsApp recusou a alteraÃ§Ã£o.');
        }

        await reagir(message, somenteAdmins ? 'ð' : 'ð');
        await responderCitando(
            message,
            somenteAdmins
                ? `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððð ððððððð*\nâ\nââ¤ ð _Somente administradores podem enviar mensagens._\nâ\nââ¤ ð Para abrir novamente:\nâ   *${PREFIXO}gp a*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`
                : `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððð ðððððð*\nâ\nââ¤ ð¥ _Todos os membros podem enviar mensagens._\nâ\nââ¤ ð Para fechar novamente:\nâ   *${PREFIXO}gp f*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`
        );
    } catch (erro) {
        console.error('â ERRO AO ALTERAR PERMISSÃO DE MENSAGENS DO GRUPO:', erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ    *ðððð ðð ððððð*\nâ\nââ¤ _NÃ£o consegui alterar as permissÃµes._\nâ\nââ¤ ð Verifique se o bot Ã© administrador.\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

async function menuJogos(message) {

    await reagir(
        message,
        'ð®'
    );

    await responderCitando(
        message,
        `âââ¢âà¼ºð®à¼»ââ¢ââ
â
â      *ð® ððððð*
â
ââ¯
â
ââ¤ ð² *${PREFIXO}dado*
â   _Rola um dado_
â
ââ¤ ðª *${PREFIXO}moeda*
â   _Cara ou coroa_
â
ââ¤ ð® *${PREFIXO}sn*
â   _Sim ou nÃ£o_
â
ââ¤ âï¸ *${PREFIXO}ppt*
â   _Pedra, papel ou tesoura_
â
ââ¤ ð¢ *${PREFIXO}adivinha*
â   _Adivinhe o nÃºmero_
â
ââ¤ ð¯ *${PREFIXO}chute @pessoa*
â   _Desafie alguÃ©m_
â
ââ¤ â¤ï¸ *${PREFIXO}ppp @pessoa*
â   _Pega, pensa ou passa?_
â
ââ¤ âï¸ *${PREFIXO}minerar*
â   _Minerar e ganhar moedas_
â
ââ¤ ðª *${PREFIXO}loja*
â   _Ver a loja de itens_
â
ââ¤ ð *${PREFIXO}comprar <item>*
â   _Comprar um item_
â
ââ¤ ð *${PREFIXO}inventario*
â   _Ver seus itens_
â
ââ¤ ð° *${PREFIXO}slots 100*
â   _Aposte suas moedas_
â
ââ¤ ð° *${PREFIXO}saldo*
â   _Ver sua carteira_
â
ââ¤ ð¸ *${PREFIXO}doar 500 @pessoa*
â   _Transferir moedas para alguÃ©m_
â
ââ¤ ð *${PREFIXO}rankingdinheiro*
â   _Ver os mais ricos do grupo_
â
ââ¤ ð *${PREFIXO}sortearm 500*
â   _Sorteio de moedas para admins_
â
â
ââ¤ ð¥ *${PREFIXO}batata*
â   _ComeÃ§a a batata quente com tempo_
â
ââ¤ ð¥ *${PREFIXO}passar @pessoa*
â   _Passa a batata para outra pessoa_
â
ââ¤ ð« *${PREFIXO}rr*
â   _Roleta russa: alguÃ©m serÃ¡ expulso_
â
ââ¤ ðª¢ *${PREFIXO}forca*
â   _Jogue forca com o grupo_
â
ââ¤ ð *${PREFIXO}revforca*
â   _Revela a palavra da forca (ADM)_
â
ââ¤ ð *${PREFIXO}stop*
â   _Jogue STOP com o grupo_
â
âââ¢âà¼ºð®à¼»ââ¢ââ`
    );
}

// ============================================================
// ð EXIGIR ADMIN PARA AVISOS
// ============================================================

async function exigirAdminAviso(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE Ã GRUPO
        // ========================================================

        if (
            !chatId ||
            !chatId.endsWith('@g.us')
        ) {

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºðà¼»ââ¢ââ
ââ¯ *ððððððð ðð ððððð*
â
ââ¤ _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
                                    'ColeÃ§Ãµes do WhatsApp nÃ£o disponÃ­veis.'
                            };
                        }

                        const chat =
                            Store.Chat.get(chatId);

                        if (!chat) {
                            return {
                                erro:
                                    'Grupo nÃ£o encontrado.'
                            };
                        }

                        const participantes =
                            chat.groupMetadata?.participants;

                        if (!participantes) {
                            return {
                                erro:
                                    'Participantes nÃ£o encontrados.'
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
                'â Erro ao obter dados do grupo:',
                dadosChat?.erro
            );

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ ï¸à¼»ââ¢ââ
ââ¯ *ðððð ðð ððððððððð*
â
ââ¤ _NÃ£o foi possÃ­vel verificar_
â   _as permissÃµes do grupo._
â
âââ¢âà¼ºâ ï¸à¼»ââ¢ââ`
            );

            return false;
        }

        // ========================================================
        // VERIFICAR ADMIN DO USUÃRIO
        // ========================================================

        const idRemetente =
            obterIdRemetente(message);

        console.log(
            '========== ð ADMIN AVISO =========='
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
        // USUÃRIO NÃO Ã ADMIN
        // ========================================================

        if (!usuarioAdmin) {

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºð«à¼»ââ¢ââ
ââ¯ *ðððððð ðððððð*
â
ââ¤ _VocÃª precisa ser administrador_
â   _para gerenciar os avisos._
â
âââ¢âà¼ºð«à¼»ââ¢ââ`
            );

            return false;
        }

        // ========================================================
        // USUÃRIO Ã ADMIN
        // ========================================================

        console.log(
            'â USUÃRIO Ã ADMINISTRADOR!'
        );

        return true;

    } catch (erro) {

        console.error(
            'â Erro ao verificar administrador:',
            erro
        );

        await reagir(message, 'â');

        await responderCitando(
            message,
            `âââ¢âà¼ºâ ï¸à¼»ââ¢ââ
ââ¯ *ðððð*
â
ââ¤ _NÃ£o foi possÃ­vel verificar_
â   _suas permissÃµes._
â
ââ¤ _Tente novamente em alguns segundos._
â
âââ¢âà¼ºâ ï¸à¼»ââ¢ââ`
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
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ð *NOVO AVISO* ã
â
â â Formato invÃ¡lido!
â
â Use:
â *;aviso HH:MM / mensagem*
â
â Exemplo:
â *;aviso 12:30 / Hora do almoÃ§o*
â
â°ââââââââââââââââ`
        );

        return;
    }

    const hora = texto.slice(0, separador).trim();
    const mensagem = texto.slice(separador + 1).trim();

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ð *NOVO AVISO* ã
â
â â *HorÃ¡rio invÃ¡lido!*
â
â Use o formato:
â *HH:MM*
â
â Exemplo:
â *12:30*
â
â°ââââââââââââââââ`
        );

        return;
    }

    if (!mensagem) {
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ð *NOVO AVISO* ã
â
â â VocÃª precisa informar
â a mensagem do aviso.
â
â Exemplo:
â *;aviso 12:30 / Hora do almoÃ§o*
â
â°ââââââââââââââââ`
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

    await reagir(message, 'ð');

    await responderCitando(
        message,
        `â­âã ð *ððððð ðððððððð* ã
â
â â *ð¨ðððð ðððððð ððð ððððððð!*
â
â ð ðð¨ð«Ã¡ð«ð¢ð¨: *${hora}*
â ð¬ ð´ððððððð: *${mensagem}*
â ð ð¹ðððððÃ§Ã£ð: *Diariamente*
â
â°ââââââââââââââââ`
    );
}

async function removerAviso(message, argumentos) {
    if (!(await exigirAdminAviso(message))) return;

    const hora = String(argumentos || '').trim();

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ðï¸ *REMOVER AVISO* ã
â
â â HorÃ¡rio invÃ¡lido!
â
â Use:
â *;rem_aviso HH:MM*
â
â Exemplo:
â *;rem_aviso 12:30*
â
â°ââââââââââââââââ`
        );

        return;
    }

    const lista = avisos.get(message.from) || [];

    const encontrados = lista.filter(aviso => aviso.hora === hora);

    if (encontrados.length === 0) {
        await reagir(message, 'ð­');

        await responderCitando(
            message,
            `â­âã ðï¸ *REMOVER AVISO* ã
â
â ð­ Nenhum aviso encontrado
â para o horÃ¡rio *${hora}*.
â
â°ââââââââââââââââ`
        );

        return;
    }

    // Se houver apenas um aviso nesse horÃ¡rio
    if (encontrados.length === 1) {
        const indice = lista.findIndex(
            aviso => aviso.id === encontrados[0].id
        );

        const removido = lista.splice(indice, 1)[0];

        if (lista.length === 0) {
            avisos.delete(message.from);
        }

        salvarAvisos();

        await reagir(message, 'ðï¸');

        await responderCitando(
            message,
            `â­âã ðï¸ *ð¨ð½ð°ðºð¶ ð¹ð¬ð´ð¶ð½ð°ð«ð¶* ã
â
â â *ð¨ðððð ðððððððð ððð ððððððð!*
â
â ð ðð¨ð«Ã¡ð«ð¢ð¨: *${removido.hora}*
â ð¬  ð´ððððððð: *${removido.mensagem}*
â
â°ââââââââââââââââ`
        );

        return;
    }

    // Mais de um aviso no mesmo horÃ¡rio
    const chave = `${message.from}_${obterIdRemetente(message)}`;

    confirmacoesRemoverAviso.set(chave, {
        hora,
        ids: encontrados.map(aviso => aviso.id)
    });

    let resposta = `â­âã ðï¸ *REMOVER AVISO* ã
â
â â ï¸ Existem *${encontrados.length} avisos*
â cadastrados para *${hora}*.
â
â Escolha qual deseja remover:
â
`;

    encontrados.forEach((aviso, index) => {
        resposta += `â *${index + 1}.* ð¬ ${aviso.mensagem}
â
`;
    });

    resposta += `â âââââââââââââââââ
â
â ð Responda apenas com o
â nÃºmero do aviso.
â
â Exemplo: *1*
â
â°ââââââââââââââââ`;

    await responderCitando(message, resposta);
}

async function processarSelecaoRemoverAviso(message) {
    const idRemetente = obterIdRemetente(message);
    const chave = `${message.from}_${idRemetente}`;

    const pendencia = confirmacoesRemoverAviso.get(chave);

    if (!pendencia) {
        return false;
    }

    // Se o usuÃ¡rio quiser executar outro comando,
    // deixa o processamento normal continuar.
    if (message.body.trim().startsWith(PREFIXO)) {
    }

    const texto = message.body.trim();

    if (texto.toLowerCase() === 'cancelar') {
        confirmacoesRemoverAviso.delete(chave);

        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ðï¸ *REMOVER AVISO* ã
â
â â *OperaÃ§Ã£o cancelada.*
â
â°ââââââââââââââââ`
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
            `â­âã ðï¸ *REMOVER AVISO* ã
â
â â OpÃ§Ã£o invÃ¡lida!
â
â Responda com um nÃºmero
â entre *1* e *${pendencia.ids.length}*.
â
â Ou envie *cancelar*.
â
â°ââââââââââââââââ`
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
        await reagir(message, 'â');

        await responderCitando(
            message,
            `â­âã ðï¸ *REMOVER AVISO* ã
â
â â Esse aviso nÃ£o existe mais.
â
â°ââââââââââââââââ`
        );

        return true;
    }

    const removido = lista.splice(indice, 1)[0];

    if (lista.length === 0) {
        avisos.delete(message.from);
    }

    salvarAvisos();

    await reagir(message, 'ðï¸');

    await responderCitando(
        message,
        `â­âã ðï¸ *AVISO REMOVIDO* ã
â
â â *Aviso removido com sucesso!*
â
â ð HorÃ¡rio: *${removido.hora}*
â ð¬ Mensagem: *${removido.mensagem}*
â
â°ââââââââââââââââ`
    );

    return true;
}

function fonteEstilizada(texto) {
    const normal =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const estilizado =
        'ð°ð±ð²ð³ð´ðµð¶ð·ð¸ð¹ðºð»ð¼ð½ð¾ð¿ðððððððððð' +
        'ððððððððððððððððððððððð ð¡ð¢ð£' +
        'ð¶ð·ð¸ð¹ðºð»ð¼ð½ð¾ð¿';

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

        await reagir(message, 'ð');

        await responderCitando(
            message,
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ð ð¨ð½ð°ðºð¶ðº ð·ð¹ð¶ð®ð¹ð¨ð´ð¨ð«ð¶ðº*
â
ââ¤ _ðµÃ£ð ðÃ¡ ðððððð ððððððððððð._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
        );

        return;
    }

    const avisosOrdenados = [...lista].sort((a, b) =>
        a.hora.localeCompare(b.hora)
    );

    let texto = `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ð ð¨ð½ð°ðºð¶ðº ð·ð¹ð¶ð®ð¹ð¨ð´ð¨ð«ð¶ðº*
â
`;

    avisosOrdenados.forEach((aviso, index) => {

        texto += `ââ¤ *${index + 1}. â° ${aviso.hora}*
â   â³ *${aviso.mensagem}*
â
`;
    });

    texto += `âââ¢âà¼ºâ¿à¼»ââ¢ââ`;

    await reagir(message, 'ð');

    await responderCitando(
        message,
        texto
    );
}

async function jogoPPP(message) {

    try {

        const chatId = message.from;

        // ========================================================
        // VERIFICAR SE Ã GRUPO
        // ========================================================

        if (!chatId || !chatId.endsWith('@g.us')) {

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððð, ððððð ðð ððððð*
â
ââ¤ _Esse jogo sÃ³ funciona em grupos._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
                        'â Erro ao obter participantes do PPP:',
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

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððð, ððððð ðð ððððð*
â
ââ¤ _NÃ£o consegui encontrar os participantes._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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

            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððð, ððððð ðð ððððð*
â
ââ¤ _NÃ£o hÃ¡ participantes disponÃ­veis._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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
        // MONTAR MENÃÃO
        // ========================================================

        const numeroMencao =
            idEscolhido.split('@')[0];

        await reagir(message, 'ð¯');
        // ========================================================
        // ENVIAR MENSAGEM
        // ========================================================

        const textoPPP = `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððð, ððððð ðð ððððð*
â
ââ¤ @${numeroMencao}
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`;

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
                        'â Erro ao localizar mensagem PPP:',
                        erro
                    );

                    return null;
                }
            },
            chatId,
            textoPPP
        );

        console.log(
            'ð¯ ID DA MENSAGEM PPP:',
            mensagemPPP
        );

        if (!mensagemPPP || !mensagemPPP.id) {
            throw new Error(
                'NÃ£o foi possÃ­vel localizar o ID da mensagem do PPP.'
            );
        }

        // Cria a enquete
   const enquete =
            new Poll(
                'ððð ð, ð©ðð§ð¬ð ð¨ð® ð©ðð¬ð¬ð?',
                [
                    'â¤ï¸ ððð ð',
                    'ð­ ððð§ð¬ð',
                    'â ððð¬ð¬ð'
                ],
                {
                    allowMultipleAnswers: false
                }
            );

        // Envia a enquete respondendo Ã  mensagem do PPP
        await client.sendMessage(
            chatId,
            enquete,
            {
                quotedMessageId: mensagemPPP.id
            }
        );

    } catch (erro) {
        console.error(
            'â Erro no jogo PPP:',
            erro
        );

        await reagir(message, 'â');

        await responderCitando(
            message,
            `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðððð, ððððð ðð ððððð*
â
ââ¤ _Ocorreu um erro ao realizar o sorteio._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
        );
    }
}

async function comandoOiAuto(message) {
    try {
        const chatId = message.from;

        // SÃ³ funciona em grupos
        if (!chatId || !chatId.endsWith('@g.us')) {
            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðð ðððð*
â
ââ¤ _Esse comando sÃ³ funciona em grupos._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
            );

            return;
        }

        // Verifica se quem usou Ã© administrador
        if (!(await exigirAdmin(message))) {
            await reagir(message, 'â');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðð ðððð*
â
ââ¤ _Apenas administradores podem usar esse comando._
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
            );

            return;
        }

        // Verifica o estado atual
        const ativo = oiAutoAtivo.get(chatId) === true;

        // ========================================================
        // ð´ DESATIVAR
        // ========================================================

        if (ativo) {

            oiAutoAtivo.delete(chatId);

            salvarOiAuto();

            await reagir(message, 'ð´');

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðð ðððð*
â
ââ¤ ð´ _Comando desativado!_
â
ââ¤ O bot nÃ£o responderÃ¡ mais automaticamente.
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
            );

        // ========================================================
        // ð¢ ATIVAR
        // ========================================================

        } else {

            oiAutoAtivo.set(
                chatId,
                true
            );

            salvarOiAuto();

            await reagir(message, 'ð¢');

            await enviarComMencoes(
                chatId,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ðð ðððð*
â
ââ¤ ð¢ _ðð¨ð¦ðð§ðð¨ ðð­ð¢ð¯ððð¨!_
â
ââ¤ ðð®ðð§ðð¨ @553298631752 ð¦ðð§ððð« "ð¨ð¢", "ð¨ð¥ð" ð¨ð® "ð¨ð¥Ã¡",
â   ð¨ ðð¨ð­ ð«ðð¬ð©ð¨ð§ððð«Ã¡:
â
ââ¤ *Ola Incrivel Bea!*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`,
                {
                    quotedMessageId: message.id._serialized,
                    mentions: [numeroOiAuto]
                }
            );
        }

    } catch (erro) {

        console.error(
            'â Erro no comando OI AUTO:',
            erro
        );

        await reagir(message, 'â');
    }
}

// ============================================================
// ðï¸ TTS E MODIFICADORES DE VOZ
// ============================================================

const EFEITOS_VOZ = {
    esquilo: { nome: 'ð¿ï¸ Esquilo', filtro: 'asetrate=44100*1.55,aresample=44100,atempo=0.645' },
    chipmunk: { nome: 'ð¿ï¸ Chipmunk', filtro: 'asetrate=44100*1.8,aresample=44100,atempo=0.556' },
    agudo: { nome: 'ð Agudo', filtro: 'asetrate=44100*1.35,aresample=44100,atempo=0.741' },
    demonio: { nome: 'ð¹ DemÃ´nio', filtro: 'asetrate=44100*0.62,aresample=44100,atempo=1.613,acompressor=threshold=-18dB:ratio=3:attack=5:release=80' },
    grave: { nome: 'ð¿ Grave', filtro: 'asetrate=44100*0.72,aresample=44100,atempo=1.389' },
    robo: { nome: 'ð¤ RobÃ´', filtro: 'highpass=f=180,lowpass=f=5200,aecho=0.8:0.7:35:0.3,aphaser=in_gain=0.5:out_gain=0.7:delay=2:decay=0.4:speed=0.6' },
    radio: { nome: 'ð» RÃ¡dio', filtro: 'highpass=f=350,lowpass=f=3000,acompressor=threshold=-18dB:ratio=4:attack=5:release=80' },
    telefone: { nome: 'âï¸ Telefone', filtro: 'highpass=f=500,lowpass=f=2500,acompressor=threshold=-20dB:ratio=5:attack=3:release=60' },
    megafone: { nome: 'ð¢ Megafone', filtro: 'highpass=f=250,lowpass=f=4200,acompressor=threshold=-16dB:ratio=6:attack=2:release=50,aecho=0.8:0.6:25:0.2' },
    eco: { nome: 'ðï¸ Eco', filtro: 'aecho=0.8:0.88:650:0.45' },
    cavern: { nome: 'ð³ï¸ Caverna', filtro: 'aecho=0.8:0.9:900:0.5,aecho=0.8:0.7:1800:0.3' },
    alien: { nome: 'ð½ AlienÃ­gena', filtro: 'asetrate=44100*1.25,aresample=44100,atempo=0.8,aphaser=in_gain=0.5:out_gain=0.7:delay=3:decay=0.5:speed=0.8' },
    distorcido: { nome: 'ð¥ Distorcido', filtro: 'acrusher=bits=8:mix=0.75,acompressor=threshold=-12dB:ratio=5:attack=2:release=40' },
    reverso: { nome: 'ð Reverso', filtro: 'areverse' }
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
            if (codigo !== 0) return reject(new Error(`FFmpeg terminou com cÃ³digo ${codigo}: ${erro.trim()}`));
            resolve();
        });
    });
}

async function obterMensagemDeAudio(message) {
    if (message.hasMedia) return message;
    if (message.hasQuotedMsg) {
        const citada = await message.getQuotedMessage();
        if (citada && citada.hasMedia) return citada;
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

// Cache local para Ã¡udios gerados pelo prÃ³prio bot.
// Isso evita depender de um novo download do WhatsApp a cada efeito aplicado.
const CACHE_AUDIO_TTL = 30 * 60 * 1000;
const CACHE_AUDIO_MAXIMO = 50;
const cacheAudioLocal = new Map();

function obterChavesMensagem(mensagem) {
    const id = mensagem?.id || {};
    const raw = mensagem?.rawData || mensagem?._data || {};
    const chaves = [];

    const adicionar = valor => {
        if (valor === undefined || valor === null || valor === '') return;
        const chave = String(valor);
        if (!chaves.includes(chave)) chaves.push(chave);
    };

    // O id.id Ã© o identificador interno da mensagem e normalmente permanece
    // igual mesmo quando whatsapp-web.js expÃµe $1/_serialized de formas diferentes.
    adicionar(id.id);
    adicionar(id.$1);
    adicionar(id._serialized);

    if (id.id && id.remote !== undefined) {
        adicionar(`${id.fromMe ? '1' : '0'}_${id.remote}_${id.id}`);
        adicionar(`${id.fromMe ? 'true' : 'false'}_${id.remote}_${id.id}`);
        adicionar(`${id.remote}_${id.id}`);
    }

    adicionar(raw.id);
    adicionar(raw.msgId);
    adicionar(raw.key?.id);
    adicionar(raw.key?._serialized);
    adicionar(raw.key?.remoteJid && raw.key?.id ? `${raw.key.remoteJid}_${raw.key.id}` : null);

    return chaves;
}

function obterChaveMensagem(mensagem) {
    return obterChavesMensagem(mensagem)[0] || null;
}

async function limparCacheAudioLocal() {
    const agora = Date.now();
    const itensUnicos = new Map();

    for (const [chave, item] of cacheAudioLocal) {
        if (!item?.caminho || item.expiraEm <= agora) {
            if (item?.caminho) await fs.promises.unlink(item.caminho).catch(() => {});
            cacheAudioLocal.delete(chave);
            continue;
        }
        itensUnicos.set(item.caminho, item);
    }

    if (itensUnicos.size <= CACHE_AUDIO_MAXIMO) return;

    const itensOrdenados = [...itensUnicos.entries()].sort((a, b) => a[1].criadoEm - b[1].criadoEm);
    const remover = itensOrdenados.slice(0, itensOrdenados.length - CACHE_AUDIO_MAXIMO);

    for (const [caminho, item] of remover) {
        await fs.promises.unlink(caminho).catch(() => {});
        for (const [chave, valor] of cacheAudioLocal) {
            if (valor === item) cacheAudioLocal.delete(chave);
        }
    }
}

async function obterAudioDoCache(mensagem) {
    const chaves = obterChavesMensagem(mensagem);
    if (!chaves.length) return null;

    for (const chave of chaves) {
        const item = cacheAudioLocal.get(chave);
        if (!item) continue;

        if (item.expiraEm <= Date.now()) {
            await fs.promises.unlink(item.caminho).catch(() => {});
            for (const [chaveCache, valor] of cacheAudioLocal) {
                if (valor === item) cacheAudioLocal.delete(chaveCache);
            }
            continue;
        }

        try {
            await fs.promises.access(item.caminho);
            return item.caminho;
        } catch (_) {
            for (const [chaveCache, valor] of cacheAudioLocal) {
                if (valor === item) cacheAudioLocal.delete(chaveCache);
            }
        }
    }

    return null;
}

async function guardarAudioNoCache(mensagem, caminhoOrigem) {
    const chaves = obterChavesMensagem(mensagem);
    if (!chaves.length || !caminhoOrigem) return null;

    const pastaCache = path.join(os.tmpdir(), 'justbot-voz-cache');
    await fs.promises.mkdir(pastaCache, { recursive: true });
    await limparCacheAudioLocal();

    const nomeSeguro = Buffer.from(chaves[0]).toString('base64').replace(/[^a-zA-Z0-9_-]/g, '_');
    const caminhoCache = path.join(pastaCache, `${nomeSeguro}-${Date.now()}.ogg`);
    await fs.promises.copyFile(caminhoOrigem, caminhoCache);

    // Remove qualquer entrada anterior que corresponda a uma das representaÃ§Ãµes
    // deste mesmo ID, evitando arquivos duplicados no cache.
    const anteriores = new Set();
    for (const chave of chaves) {
        const anterior = cacheAudioLocal.get(chave);
        if (anterior) anteriores.add(anterior);
    }
    for (const anterior of anteriores) {
        for (const [chave, valor] of cacheAudioLocal) {
            if (valor === anterior) cacheAudioLocal.delete(chave);
        }
        await fs.promises.unlink(anterior.caminho).catch(() => {});
    }

    const item = {
        caminho: caminhoCache,
        criadoEm: Date.now(),
        expiraEm: Date.now() + CACHE_AUDIO_TTL,
    };

    // Guarda todas as formas do ID. Assim, sendMessage() e getQuotedMessage()
    // podem usar representaÃ§Ãµes diferentes e ainda encontrar o mesmo arquivo.
    for (const chave of chaves) {
        cacheAudioLocal.set(chave, item);
    }

    await limparCacheAudioLocal();
    return caminhoCache;
}

async function baixarMidiaWhatsAppCompativel(mensagem) {
    const raw = mensagem?.rawData || mensagem?._data || {};

    // O WhatsApp Web atual estÃ¡ migrando os IDs de _serialized para $1.
    // Para mÃ­dia, tentamos primeiro usar os dados criptogrÃ¡ficos que jÃ¡ vieram
    // no prÃ³prio objeto Message, sem depender da busca Msg.get().
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
        ultimoErro = new Error('Dados criptogrÃ¡ficos da mÃ­dia incompletos no objeto Message.');
    }

    const id = mensagem?.id || {};
    const candidatos = [];

    // $1 Ã© o novo nome usado por algumas versÃµes recentes do WhatsApp Web.
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

    // Ãltimo recurso: usa a implementaÃ§Ã£o oficial da biblioteca. NÃ£o fazemos
    // reload() aqui porque Message.reload() ainda depende de id._serialized em
    // whatsapp-web.js 1.34.7 e pode substituir o erro real por outro t: t.
    // Alguns Ã¡udios citados pelo bot chegam como objetos simples, sem o
    // mÃ©todo downloadMedia(). Nesse caso nÃ£o devemos chamar esse mÃ©todo.
    if (typeof mensagem?.downloadMedia === 'function') {
        try {
            const midia = await mensagem.downloadMedia();
            if (midia) return midia;
        } catch (erroOficial) {
            ultimoErro = erroOficial;
        }
    } else if (!ultimoErro) {
        ultimoErro = new Error('Objeto de mÃ­dia citado nÃ£o possui downloadMedia().');
    }

    throw new Error(`Download de mÃ­dia falhou: ${formatarErroDownload(ultimoErro)}`);
}

async function modificarAudio(message, comando) {
    const efeito = obterEfeitoDeVoz(comando);
    if (!efeito) return false;

    try {
        const mensagemAudio = await obterMensagemDeAudio(message);
        if (!mensagemAudio) {
            await reagir(message, 'ðï¸');
            await responderCitando(message, `âââ¢âà¼ºðï¸à¼»ââ¢ââ\nâ       *ðððððð ðð ððð*\nââ¯\nâ\nââ¤ ðï¸ _Envie um Ã¡udio junto com_ *${PREFIXO}${comando}*\nâ   _ou responda a um Ã¡udio com o comando._\nâ\nâââ¢âà¼ºðï¸à¼»ââ¢ââ`);
            return true;
        }

        const pasta = path.join(os.tmpdir(), 'justbot-voz');
        await fs.promises.mkdir(pasta, { recursive: true });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const entrada = path.join(pasta, `${id}-input${extensaoAudio(mensagemAudio?.mimetype)}`);
        const saida = path.join(pasta, `${id}-output.ogg`);
        let entradaEhDoCache = false;

        try {
            // Primeiro tenta usar o arquivo local. Isso Ã© especialmente importante
            // para TTS e para cadeias de vÃ¡rios efeitos enviados pelo prÃ³prio bot.
            const caminhoCache = await obterAudioDoCache(mensagemAudio);

            if (caminhoCache) {
                entradaEhDoCache = true;
                await executarFFmpeg([
                    '-hide_banner', '-loglevel', 'error', '-y', '-i', caminhoCache,
                    '-t', '60', '-af', efeito.filtro, '-vn',
                    '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on',
                    '-application', 'voip', saida
                ]);
            } else {
                let midia = null;
                let ultimoErroDownload = null;

                for (let tentativa = 1; tentativa <= 3; tentativa++) {
                    try {
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
                    throw new Error(`NÃ£o foi possÃ­vel baixar o Ã¡udio do WhatsApp apÃ³s 3 tentativas: ${ultimoErroDownload?.message || 'mÃ­dia indisponÃ­vel'}`);
                }
                if (!String(midia.mimetype || '').toLowerCase().startsWith('audio/')) {
                    await reagir(message, 'â');
                    await responderCitando(message, 'â _A mÃ­dia selecionada nÃ£o Ã© um Ã¡udio vÃ¡lido._');
                    return true;
                }

                await fs.promises.writeFile(entrada, Buffer.from(midia.data, 'base64'));
                await executarFFmpeg([
                    '-hide_banner', '-loglevel', 'error', '-y', '-i', entrada,
                    '-t', '60', '-af', efeito.filtro, '-vn',
                    '-c:a', 'libopus', '-b:a', '64k', '-vbr', 'on',
                    '-application', 'voip', saida
                ]);
            }

            const dados = await fs.promises.readFile(saida);
            if (!dados.length) throw new Error('FFmpeg nÃ£o gerou o Ã¡udio processado.');

            const audio = new MessageMedia('audio/ogg; codecs=opus', dados.toString('base64'), `${comando}.ogg`);
            await reagir(message, 'ðï¸');
            await responderCitando(message, `âââ¢âà¼ºðï¸à¼»ââ¢ââ\nâ       *ðððððð ðð ððð*\nââ¯\nâ\nââ¤ ${efeito.nome}\nâ   _Ãudio processado com sucesso!_\nâ\nâââ¢âà¼ºðï¸à¼»ââ¢ââ`);

            const mensagemEnviada = await client.sendMessage(message.from, audio, { sendAudioAsVoice: true });

            // Guarda o resultado pelo ID da mensagem enviada. O prÃ³ximo efeito
            // encontrarÃ¡ este arquivo localmente e nÃ£o precisarÃ¡ baixÃ¡-lo do WhatsApp.
            await guardarAudioNoCache(mensagemEnviada, saida);
        } finally {
            if (!entradaEhDoCache) {
                await fs.promises.unlink(entrada).catch(() => {});
            }
            await fs.promises.unlink(saida).catch(() => {});
        }
    } catch (erro) {
        console.error(`â Erro no efeito de voz ${comando}:`, erro);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ       *ðððððð ðð ððð*\nââ¯\nâ\nââ¤ â _NÃ£o consegui aplicar_ *${efeito.nome}*\nâ   _Verifique se o Ã¡udio Ã© vÃ¡lido e tente novamente._\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
    }
    return true;
}

async function comandoTTS(message, argumentos) {
    const texto = String(argumentos || '').trim();
    if (!texto) {
        await reagir(message, 'ð£ï¸');
        await responderCitando(message, `âââ¢âà¼ºð£ï¸à¼»ââ¢ââ\nâ       *ððððð ðððð ððð*\nââ¯\nâ\nââ¤ ð£ï¸ _Informe o texto que devo falar._\nâ\nââ¤ Exemplo: *${PREFIXO}tts OlÃ¡ pessoal, tudo bem?*\nâ\nâââ¢âà¼ºð£ï¸à¼»ââ¢ââ`);
        return;
    }
    if (texto.length > 10000) {
        await reagir(message, 'â ï¸');
        await responderCitando(message, `âââ¢âà¼ºâ ï¸à¼»ââ¢ââ\nâ       *ððððð ðððð ððð*\nââ¯\nâ\nââ¤ â ï¸ _O texto para TTS deve ter no mÃ¡ximo 10.000 caracteres._\nâ\nâââ¢âà¼ºâ ï¸à¼»ââ¢ââ`);
        return;
    }

    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt-BR&q=${encodeURIComponent(texto)}`;
        const resposta = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!resposta.ok) throw new Error(`Google TTS respondeu HTTP ${resposta.status}`);
        const dados = Buffer.from(await resposta.arrayBuffer());
        if (!dados.length) throw new Error('Google TTS nÃ£o retornou Ã¡udio.');

        // O Google TTS retorna MP3, mas o WhatsApp funciona de forma muito
        // mais confiÃ¡vel com mensagem de voz em OGG/Opus.
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
            if (!dadosOpus.length) throw new Error('FFmpeg nÃ£o gerou o Ã¡udio OGG.');

            const audio = new MessageMedia(
                'audio/ogg; codecs=opus',
                dadosOpus.toString('base64'),
                'tts.ogg'
            );

            await reagir(message, 'ð£ï¸');
            await responderCitando(message, `âââ¢âà¼ºð£ï¸à¼»ââ¢ââ\nâ       *ððððð ðððð ððð*\nââ¯\nâ\nââ¤ ð£ï¸ _Voz gerada com sucesso!_\nâ   _Seu Ã¡udio estÃ¡ logo abaixo._\nâ\nâââ¢âà¼ºð£ï¸à¼»ââ¢ââ`);

            const mensagemEnviada = await client.sendMessage(message.from, audio, { sendAudioAsVoice: true });

            // MantÃ©m o OGG localmente para que efeitos aplicados por resposta
            // possam usar o arquivo original sem fazer novo download do WhatsApp.
            await guardarAudioNoCache(mensagemEnviada, saida);
        } finally {
            await Promise.allSettled([
                fs.promises.unlink(entrada),
                fs.promises.unlink(saida)
            ]);
        }
    } catch (erro) {
        console.error('â Erro no Google TTS:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui gerar a voz agora. Tente novamente em alguns segundos._');
    }
}


// ============================================================
// ð§° NOVAS UTILIDADES E DIVERSÃO
// ============================================================

const timersUtilidade = new Map();

function formatarDuracao(segundos) {
    const total = Math.max(0, Math.floor(Number(segundos) || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
        ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
        : `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatarPessoaAlvo(pessoa) {
    return pessoa ? `@${String(idDaPessoa(pessoa) || '').split('@')[0]}` : 'vocÃª';
}

async function obterAlvoComContato(message, obrigatorio = false) {
    try {
        const mencoes = await message.getMentions();
        if (mencoes?.length) return mencoes[0];
    } catch {}

    if (message.hasQuotedMsg) {
        try {
            const citada = await message.getQuotedMessage();
            const id = citada?.author || citada?.from;
            if (id) {
                try {
                    const contato = await client.getContactById(id);
                    if (contato) return contato;
                } catch {}
            }
        } catch {}
    }

    if (obrigatorio) {
        await reagir(message, 'â');
        await responderCitando(
            message,
            `âââ¢âà¼ºð¤à¼»ââ¢ââ\nââ¯ *ðððð ððÌð ðððððððððð*\nâ\nââ¤ _Mencione alguÃ©m ou responda Ã  mensagem da pessoa._\nâ\nââ¤ *Exemplo:* *${PREFIXO}nota @pessoa*\nâââ¢âà¼ºð¤à¼»ââ¢ââ`
        );
    }
    return null;
}

async function responderAlvoComMencao(message, texto, pessoa) {
    const id = pessoa ? idDaPessoa(pessoa) : null;
    if (id) {
        return enviarComMencoes(message.from, texto, {
            mentions: [id],
            quotedMessageId: obterIdMensagem(message)
        });
    }
    return responderCitando(message, texto);
}

async function comandoUptime(message) {
    await reagir(message, 'â±ï¸');
    await responderCitando(message, `âââ¢âà¼ºâ±ï¸à¼»ââ¢ââ\nâ      *ðððððð*\nââ¯\nâ\nââ¤ ð¤ Bot online hÃ¡: *${formatarDuracao(process.uptime())}*\nââ¤ ð¢ Processo ativo e respondendo.\nâ\nâââ¢âà¼ºâ±ï¸à¼»ââ¢ââ`);
}

async function comandoStatus(message) {
    const memoria = process.memoryUsage();
    const usoMB = (memoria.rss / 1024 / 1024).toFixed(1);
    const heapMB = (memoria.heapUsed / 1024 / 1024).toFixed(1);
    const versao = typeof VERSAO !== 'undefined' ? VERSAO : 'atual';
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ðððððð*\nââ¯\nâ\nââ¤ ð¢ *Online*\nââ¤ â±ï¸ Uptime: *${formatarDuracao(process.uptime())}*\nââ¤ ð¾ RAM: *${usoMB} MB*\nââ¤ ð§  Heap: *${heapMB} MB*\nââ¤ ð¢ VersÃ£o: *${versao}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoAvatar(message) {
    const pessoa = await obterAlvoComContato(message, false);
    const contato = pessoa || await client.getContactById(obterIdRemetente(message));
    if (!contato) {
        await reagir(message, 'â');
        return;
    }
    try {
        const url = await contato.getProfilePicUrl();
        if (!url) {
            await reagir(message, 'ð¤');
            await responderCitando(message, `âââ¢âà¼ºð¤à¼»ââ¢ââ\nâ       *ðððð ðð ðððððð*\nââ¯\nâ\nââ¤ ð¤ _Essa pessoa nÃ£o possui uma foto de perfil pÃºblica._\nâ\nâââ¢âà¼ºð¤à¼»ââ¢ââ`);
            return;
        }
        const midia = await MessageMedia.fromUrl(url, { unsafeMime: true });
        await reagir(message, 'ð¼ï¸');
        await client.sendMessage(message.from, midia, {
            caption: `ð¼ï¸ *ðððððð*\n\nð¤ ${contato.pushname || contato.name || 'UsuÃ¡rio'}`
        });
    } catch (erro) {
        console.error('â Erro no avatar:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ       *ðððð*\nââ¯\nâ\nââ¤ _NÃ£o consegui obter a foto de perfil agora._\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

async function comandoAdmins(message) {
    if (!message.from?.endsWith('@g.us')) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ       *ððððððð ðð ððððð*\nââ¯\nâ\nââ¤ _Esse comando sÃ³ funciona em grupos._\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
        return;
    }
    try {
        const admins = await client.pupPage.evaluate((grupoId) => {
            try {
                const Store = window.require('WAWebCollections');
                const chat = Store?.Chat?.get(grupoId);
                const participantes = chat?.groupMetadata?.participants;
                if (!participantes) return [];
                const modelos = typeof participantes.getModelsArray === 'function'
                    ? participantes.getModelsArray()
                    : (Array.isArray(participantes.models) ? participantes.models : []);
                return modelos
                    .filter(p => p.isAdmin || p.isSuperAdmin)
                    .map(p => p.id?._serialized || p.id?.$1 || String(p.id || ''))
                    .filter(Boolean);
            } catch { return []; }
        }, message.from);
        if (!admins.length) throw new Error('Nenhum administrador encontrado.');
        await reagir(message, 'ð');
        const texto = `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððððððððððððð*\nââ¯\nâ\n${admins.map((id, i) => `ââ¤ ð ${i + 1}. @${String(id).split('@')[0]}`).join('\n')}\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`;
        await enviarComMencoes(message.from, texto, { mentions: admins, quotedMessageId: obterIdMensagem(message) });
    } catch (erro) {
        console.error('â Erro ao listar admins:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ       *ðððð*\nââ¯\nâ\nââ¤ _NÃ£o consegui consultar os administradores deste grupo._\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
    }
}

async function comandoId(message) {
    const id = obterIdRemetente(message);
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ          *ðð*\nââ¯\nâ\nââ¤ ð¤ Seu ID:\nâ   *${id || 'indisponÃ­vel'}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoEscolher(message, argumentos) {
    const opcoes = String(argumentos || '').split(/\s*(?:\||\/|,|;|\bou\b)\s*/i).map(v => v.trim()).filter(Boolean);
    if (opcoes.length < 2) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe pelo menos duas opÃ§Ãµes._\n\nExemplo: *${PREFIXO}escolher pizza | hambÃºrguer | sushi*`);
        return;
    }
    const escolhida = escolherAleatorioSeguro(opcoes);
    await reagir(message, 'ð¯');
    await responderCitando(message, `âââ¢âà¼ºð¯à¼»ââ¢ââ\nâ       *ððððððð*\nââ¯\nâ\nââ¤ ð² Entre *${opcoes.length}* opÃ§Ãµes...\nâ\nââ¤ ð *${escolhida}*\nâ\nâââ¢âà¼ºð¯à¼»ââ¢ââ`);
}

async function comandoContador(message, argumentos) {
    const numero = Number.parseInt(String(argumentos || '').trim(), 10);
    if (!Number.isInteger(numero) || numero < 1 || numero > 60) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Use um nÃºmero entre 1 e 60._\n\nExemplo: *${PREFIXO}contador 10*`);
        return;
    }
    const chatId = message.from;
    const anterior = timersUtilidade.get(`contador:${chatId}`);
    if (anterior) clearInterval(anterior);
    let atual = numero;
    await reagir(message, 'â³');
    await responderCitando(message, `â³ *ðððððððð ðððððððð*\n\nContando de *${numero}* atÃ© *0*...`);
    const intervalo = setInterval(async () => {
        atual -= 1;
        if (atual <= 0) {
            clearInterval(intervalo);
            timersUtilidade.delete(`contador:${chatId}`);
            await responderCitando(message, 'ð *ðððð!*\n\nâ° Contagem finalizada.');
            return;
        }
        if (atual <= 5) await client.sendMessage(chatId, `â³ *${atual}*`);
    }, 1000);
    timersUtilidade.set(`contador:${chatId}`, intervalo);
}

async function comandoCronometro(message, argumentos) {
    const entrada = String(argumentos || '').trim().toLowerCase();
    const match = entrada.match(/^(\d+(?:\.\d+)?)\s*(s|seg|segundos?|m|min|minutos?|h|horas?)$/i);
    if (!match) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe o tempo, por exemplo:_ *${PREFIXO}cronometro 30s* _ou_ *${PREFIXO}cronometro 2m*`);
        return;
    }
    const valor = Number(match[1]);
    const unidade = match[2];
    const multiplicador = /^h|hora/i.test(unidade) ? 3600 : (/^m|min/i.test(unidade) ? 60 : 1);
    const segundos = Math.floor(valor * multiplicador);
    if (segundos < 1 || segundos > 86400) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _O cronÃ´metro deve ficar entre 1 segundo e 24 horas._');
        return;
    }
    const chave = `cronometro:${message.from}`;
    const anterior = timersUtilidade.get(chave);
    if (anterior) clearTimeout(anterior);
    await reagir(message, 'â±ï¸');
    await responderCitando(message, `â±ï¸ *ðððððÌððððð ðððððððð*\n\nð Vou avisar quando passarem *${formatarDuracao(segundos)}*.`);
    const timeout = setTimeout(async () => {
        timersUtilidade.delete(chave);
        await responderCitando(message, `ð *ððððð ðððððððð!*\n\nâ±ï¸ O cronÃ´metro de *${formatarDuracao(segundos)}* terminou.`);
    }, segundos * 1000);
    timersUtilidade.set(chave, timeout);
}

function avaliarExpressaoSegura(expressao) {
    const limpa = String(expressao || '').replace(/,/g, '.').replace(/Ã/g, '*').replace(/Ã·/g, '/').replace(/â/g, '-').trim();
    if (!limpa || !/^[0-9+\-*/().%\s]+$/.test(limpa)) throw new Error('expressÃ£o invÃ¡lida');
    if (/\.{2,}|\/{2,}|\*{2,}|%{2,}/.test(limpa)) throw new Error('expressÃ£o invÃ¡lida');
    const resultado = Function(`"use strict"; return (${limpa})`)();
    if (!Number.isFinite(resultado)) throw new Error('resultado invÃ¡lido');
    return resultado;
}

async function comandoCalculadora(message, argumentos) {
    try {
        const resultado = avaliarExpressaoSegura(argumentos);
        await reagir(message, 'ð§®');
        await responderCitando(message, `âââ¢âà¼ºð§®à¼»ââ¢ââ\nâ      *ððððððððððð*\nââ¯\nâ\nââ¤ ð *${String(argumentos).trim()}*\nââ¤ ð° *${resultado}*\nâ\nâââ¢âà¼ºð§®à¼»ââ¢ââ`);
    } catch {
        await reagir(message, 'â');
        await responderCitando(message, `â _ExpressÃ£o invÃ¡lida._\n\nExemplo: *${PREFIXO}calculadora (10 + 5) Ã 2*`);
    }
}

async function comandoPorcentagem(message, argumentos) {
    const partes = String(argumentos || '').replace(/,/g, '.').trim().split(/\s+/);
    if (partes.length < 2) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Use:_ *${PREFIXO}porcentagem 20% de 500*`);
        return;
    }
    const numeros = partes.map(Number).filter(Number.isFinite);
    const p = numeros[0];
    const valor = numeros[numeros.length - 1];
    if (!Number.isFinite(p) || !Number.isFinite(valor)) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui entender os nÃºmeros informados._');
        return;
    }
    const resultado = valor * p / 100;
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððððððððð*\nââ¯\nâ\nââ¤ ð *${p}%* de *${valor}*\nââ¤ ð° Resultado: *${resultado}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoRegra3(message, argumentos) {
    const numeros = String(argumentos || '').replace(/,/g, '.').match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (numeros.length !== 3) {
        await reagir(message, `â _Use trÃªs nÃºmeros: A B C._\n\nExemplo: *${PREFIXO}regra3 2 10 5*`);
        return;
    }
    const [a, b, c] = numeros;
    if (a === 0 || b === 0) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _Os dois primeiros valores nÃ£o podem ser zero._');
        return;
    }
    const x = (b * c) / a;
    await reagir(message, 'ð');
    await responderCitando(message, `ð *ððððð ðð ð*\n\n${a} â ${b}\n${c} â *${x}*`);
}

async function comandoConverter(message, argumentos) {
    const partes = String(argumentos || '').replace(/,/g, '.').trim().split(/\s+/);
    if (partes.length < 3) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Use:_ *${PREFIXO}converter 10 km mi*\n\nSuporta kmâmi, mâft, kgâlb, câf e fâc.`);
        return;
    }
    const valor = Number(partes[0]);
    const de = partes[1].toLowerCase();
    const para = partes[2].toLowerCase();
    if (!Number.isFinite(valor)) {
        await reagir(message, 'â');
        return;
    }
    const conversoes = {
        'km:mi': v => v * 0.621371, 'mi:km': v => v / 0.621371,
        'm:ft': v => v * 3.28084, 'ft:m': v => v / 3.28084,
        'kg:lb': v => v * 2.2046226218, 'lb:kg': v => v / 2.2046226218,
        'c:f': v => v * 9 / 5 + 32, 'f:c': v => (v - 32) * 5 / 9
    };
    const chave = `${de}:${para}`;
    if (!conversoes[chave]) {
        await reagir(message, 'â');
        await responderCitando(message, 'â _ConversÃ£o nÃ£o suportada. Use km/mi, m/ft, kg/lb ou Â°C/Â°F._');
        return;
    }
    const resultado = conversoes[chave](valor);
    await reagir(message, 'ð');
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððððððÌð*\nââ¯\nâ\nââ¤ ð¥ *${valor} ${de}*\nââ¤ ð¤ *${Number(resultado.toFixed(6))} ${para}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoCotacao(message, argumentos) {
    const partes = String(argumentos || '').trim().toUpperCase().split(/\s+/).filter(Boolean);
    const origem = partes[0] || 'USD';
    const destino = partes[1] || 'BRL';
    const valor = partes[2] ? Number(partes[2].replace(',', '.')) : 1;
    if (!/^[A-Z]{3}$/.test(origem) || !/^[A-Z]{3}$/.test(destino) || !Number.isFinite(valor)) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Use:_ *${PREFIXO}cotacao USD BRL 100*`);
        return;
    }
    try {
        const dados = await buscarJsonAPI(`https://open.er-api.com/v6/latest/${origem}`);
        const taxa = dados?.rates?.[destino];
        if (!Number.isFinite(taxa)) throw new Error('moeda nÃ£o encontrada');
        await reagir(message, 'ð±');
        await responderCitando(message, `âââ¢âà¼ºð±à¼»ââ¢ââ\nâ       *ðððððÌ§ðÌð*\nââ¯\nâ\nââ¤ ðµ *${valor} ${origem}*\nââ¤ ð° *${(valor * taxa).toFixed(2)} ${destino}*\nââ¤ ð Taxa: *1 ${origem} = ${taxa.toFixed(6)} ${destino}*\nâ\nâââ¢âà¼ºð±à¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro na cotaÃ§Ã£o:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui consultar a cotaÃ§Ã£o agora._');
    }
}

async function comandoTraduzir(message, argumentos) {
    const partes = String(argumentos || '').trim().split(/\s+/);
    const de = (partes.shift() || '').toLowerCase();
    const para = (partes.shift() || '').toLowerCase();
    const texto = partes.join(' ').trim();
    if (!/^[a-z]{2}$/.test(de) || !/^[a-z]{2}$/.test(para) || !texto) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Use:_ *${PREFIXO}traduzir en pt Hello world*`);
        return;
    }
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${encodeURIComponent(de)}|${encodeURIComponent(para)}`;
        const dados = await buscarJsonAPI(url);
        const traducao = dados?.responseData?.translatedText;
        if (!traducao) throw new Error('traduÃ§Ã£o vazia');
        await reagir(message, 'ð');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððððÌ§ðÌð*\nââ¯\nâ\nââ¤ ð Original: _${texto}_\nââ¤ ð *${traducao}*\nââ¤ ð¤ ${de.toUpperCase()} â ${para.toUpperCase()}\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro na traduÃ§Ã£o:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui traduzir esse texto agora._');
    }
}

async function comandoEncurtar(message, argumentos) {
    const url = String(argumentos || '').trim();
    if (!/^https?:\/\//i.test(url)) {
        await reagir(message, 'â');
        await responderCitando(message, `â _Informe um link comeÃ§ando com http:// ou https://._\n\nExemplo: *${PREFIXO}encurtar https://exemplo.com*`);
        return;
    }
    try {
        const resposta = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        const curto = (await resposta.text()).trim();
        if (!resposta.ok || !/^https?:\/\//i.test(curto)) throw new Error(curto || 'falha');
        await reagir(message, 'ð');
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ðððð ððððððððð*\nââ¯\nâ\nââ¤ ð ${curto}\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`);
    } catch (erro) {
        console.error('â Erro ao encurtar:', erro.message);
        await reagir(message, 'â');
        await responderCitando(message, 'â _NÃ£o consegui encurtar esse link agora._');
    }
}

const VERDADES = [
    'Qual foi a Ãºltima mentira boba que vocÃª contou?', 'Qual hÃ¡bito seu vocÃª esconderia de um novo amigo?',
    'Quem do grupo vocÃª chamaria para uma aventura?', 'Qual foi sua maior vergonha na escola?',
    'Qual coisa vocÃª finge gostar para nÃ£o contrariar alguÃ©m?', 'Qual foi a decisÃ£o mais impulsiva que vocÃª jÃ¡ tomou?'
];
const DESAFIOS = [
    'Envie o prÃ³ximo emoji que aparecer no seu teclado.', 'Fale uma frase sÃ©ria usando apenas emojis.',
    'Mande uma mensagem comeÃ§ando com "Eu confesso que...".', 'Escolha alguÃ©m e faÃ§a um elogio sincero.',
    'Escreva seu nome de trÃ¡s para frente.', 'Fique 30 segundos sem usar a letra A nas mensagens.'
];
const RESPOSTAS_8BALL = ['ð± Com certeza!', 'ð± Provavelmente sim.', 'ð± Os astros dizem que sim.', 'ð± Melhor nÃ£o contar com isso.', 'ð± Provavelmente nÃ£o.', 'ð± ImpossÃ­vel saber agora.', 'ð± Pergunte novamente depois.', 'ð± O destino ainda estÃ¡ decidindo.'];

async function comandoVerdade(message) {
    await reagir(message, 'ð­');
    await responderCitando(message, `âââ¢âà¼ºð­à¼»ââ¢ââ\nâ       *ððððððð*\nââ¯\nâ\nââ¤ â *${escolherAleatorioSeguro(VERDADES)}*\nâ\nâââ¢âà¼ºð­à¼»ââ¢ââ`);
}

async function comandoDesafio(message) {
    await reagir(message, 'ð¥');
    await responderCitando(message, `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ       *ððððððð*\nââ¯\nâ\nââ¤ ð¯ *${escolherAleatorioSeguro(DESAFIOS)}*\nâ\nâââ¢âà¼ºð¥à¼»ââ¢ââ`);
}

async function comandoVidente(message, argumentos) {
    if (!String(argumentos || '').trim()) {
        await reagir(message, 'ð®');
        await responderCitando(message, `âââ¢âà¼ºð®à¼»ââ¢ââ\nâ       *ððððððð*\nââ¯\nâ\nââ¤ _FaÃ§a uma pergunta para a vidente._\nââ¤ Exemplo: *${PREFIXO}vidente vou ganhar?*\nâ\nâââ¢âà¼ºð®à¼»ââ¢ââ`);
        return;
    }
    const respostas = ['ð Sim, as chances sÃ£o altas.', 'ð Talvez. O destino estÃ¡ nebuloso.', 'âï¸ NÃ£o parece provÃ¡vel.', 'ð® O futuro guarda uma surpresa.', 'â¨ Os sinais sÃ£o muito positivos.', 'ð Tente novamente quando a lua mudar.'];
    await reagir(message, 'ð®');
    await responderCitando(message, `âââ¢âà¼ºð®à¼»ââ¢ââ\nâ       *ððððððð*\nââ¯\nâ\nââ¤ â _${String(argumentos).trim()}_\nââ¤ ð® Resposta: *${escolherAleatorioSeguro(respostas)}*\nâ\nâââ¢âà¼ºð®à¼»ââ¢ââ`);
}

async function comando8Ball(message, argumentos) {
    if (!String(argumentos || '').trim()) {
        await reagir(message, 'ð±');
        await responderCitando(message, `âââ¢âà¼ºð±à¼»ââ¢ââ\nâ       *ððððð ð ðððð*\nââ¯\nâ\nââ¤ _FaÃ§a uma pergunta._\nââ¤ Exemplo: *${PREFIXO}8ball vou passar de fase?*\nâ\nâââ¢âà¼ºð±à¼»ââ¢ââ`);
        return;
    }
    await reagir(message, 'ð±');
    await responderCitando(message, `âââ¢âà¼ºð±à¼»ââ¢ââ\nâ       *ððððð ð ðððð*\nââ¯\nâ\nââ¤ â _${String(argumentos).trim()}_\nââ¤ ð± Resposta: *${escolherAleatorioSeguro(RESPOSTAS_8BALL)}*\nâ\nâââ¢âà¼ºð±à¼»ââ¢ââ`);
}

async function comandoDecidir(message, argumentos) {
    const opcoes = String(argumentos || '').split(/\s*(?:\||\/|,|;|\bou\b)\s*/i).map(v => v.trim()).filter(Boolean);
    if (opcoes.length < 2) {
        await reagir(message, 'â');
        await responderCitando(message, `âââ¢âà¼ºâà¼»ââ¢ââ\nâ       *ðððÌ§ðÌðð ððððððððððððð*\nââ¯\nâ\nââ¤ _Informe duas ou mais opÃ§Ãµes._\nââ¤ Exemplo: *${PREFIXO}decidir cinema ou praia*\nâ\nâââ¢âà¼ºâà¼»ââ¢ââ`);
        return;
    }
    await reagir(message, 'âï¸');
    await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ\nâ       *ðððððððð!*\nââ¯\nâ\nââ¤ ð¯ Minha escolha: *${escolherAleatorioSeguro(opcoes)}*\nâ\nâââ¢âà¼ºâï¸à¼»ââ¢ââ`);
}

async function comandoRelacaoAleatoria(message, tipo) {
    const pessoa = await obterAlvoComContato(message, false);
    const nome = pessoa ? formatarPessoaAlvo(pessoa) : 'vocÃª';
    const valores = { crush: [0, 100], amizade: [20, 100], inimigos: [0, 100] };
    const [min, max] = valores[tipo];
    const porcentagem = crypto.randomInt(min, max + 1);
    const emojis = { crush: 'ð', amizade: 'ð¤', inimigos: 'âï¸' };
    const titulos = { crush: 'ððððð', amizade: 'ððððððð', inimigos: 'ðððððððð' };
    const frase = tipo === 'crush' ? 'nÃ­vel de crush' : tipo === 'amizade' ? 'nÃ­vel de amizade' : 'nÃ­vel de rivalidade';
    await reagir(message, emojis[tipo]);
    await responderAlvoComMencao(message, `${emojis[tipo]} *${titulos[tipo]}*\n\nð¤ Alvo: ${nome}\nð ${frase}: *${porcentagem}%*`, pessoa);
}

async function comandoFBI(message) {
    const pessoa = await obterAlvoComContato(message, false);
    const nome = pessoa ? formatarPessoaAlvo(pessoa) : 'vocÃª';
    const suspeita = crypto.randomInt(1, 101);
    const crimes = ['roubo de biscoitos', 'excesso de memes', 'perturbaÃ§Ã£o da paz com Ã¡udios', 'contrabando de figurinhas', 'abandono de responsabilidades'];
    await reagir(message, 'ðµï¸');
    await responderAlvoComMencao(message, `âââ¢âà¼ºðµï¸à¼»ââ¢ââ\nâ         *ððð*\nââ¯\nâ\nââ¤ ð¤ Alvo: ${nome}\nââ¤ ð¨ Suspeita: *${suspeita}%*\nââ¤ ðï¸ AcusaÃ§Ã£o: _${escolherAleatorioSeguro(crimes)}_\nââ¤ ð Status: *${suspeita >= 75 ? 'PROCURADO' : suspeita >= 40 ? 'EM INVESTIGAÃÃO' : 'LIBERADO'}*\nâ\nâââ¢âà¼ºðµï¸à¼»ââ¢ââ`, pessoa);
}

async function comandoLaudo(message) {
    const pessoa = await obterAlvoComContato(message, false);
    const nome = pessoa ? formatarPessoaAlvo(pessoa) : 'vocÃª';
    const humor = ['caÃ³tico', 'questionÃ¡vel', 'surpreendentemente normal', '100% aleatÃ³rio', 'perigosamente engraÃ§ado'];
    const estado = ['funcionando normalmente', 'precisa de cafÃ©', 'em modo turbo', 'sob observaÃ§Ã£o dos cientistas'];
    await reagir(message, 'ð§ª');
    await responderAlvoComMencao(message, `âââ¢âà¼ºð§ªà¼»ââ¢ââ\nâ          *ððððð*\nââ¯\nâ\nââ¤ ð¤ Paciente: ${nome}\nââ¤ ð§  Estado mental: *${escolherAleatorioSeguro(humor)}*\nââ¤ âï¸ Estado operacional: *${escolherAleatorioSeguro(estado)}*\nââ¤ ð DiagnÃ³stico: _A ciÃªncia ainda nÃ£o explica._\nâ\nâââ¢âà¼ºð§ªà¼»ââ¢ââ`, pessoa);
}

async function comandoCurriculo(message) {
    const pessoa = await obterAlvoComContato(message, false);
    const nome = pessoa?.pushname || pessoa?.name || 'Candidato(a)';
    const cargos = ['Especialista em memes', 'Analista de grupos', 'Profissional em procrastinaÃ§Ã£o', 'Engenheiro de caos digital', 'Gerente de figurinhas'];
    const habilidades = ['memes avanÃ§ados', 'responder rÃ¡pido', 'sobreviver a grupos', 'usar emojis com precisÃ£o', 'tomar decisÃµes questionÃ¡veis'];
    await reagir(message, 'ð');
    await responderAlvoComMencao(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ðððððÌðððð*\nââ¯\nâ\nââ¤ ð¤ *${nome}*\nââ¤ ð¼ Cargo: _${escolherAleatorioSeguro(cargos)}_\nââ¤ ð ï¸ Habilidade: _${escolherAleatorioSeguro(habilidades)}_\nââ¤ â­ ExperiÃªncia: *${crypto.randomInt(1, 11)} anos*\nââ¤ ð° PretensÃ£o: *${crypto.randomInt(1200, 12001)} moedas*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`, pessoa);
}

async function comandoNota(message) {
    const pessoa = await obterAlvoComContato(message, false);
    const nome = pessoa ? formatarPessoaAlvo(pessoa) : 'vocÃª';
    const nota = crypto.randomInt(0, 101) / 10;
    const avaliacao = nota >= 9 ? 'LENDÃRIO ð' : nota >= 7 ? 'Muito bom â­' : nota >= 5 ? 'DÃ¡ para melhorar ð' : 'Precisamos conversar com o professor ð­';
    await reagir(message, 'ð');
    await responderAlvoComMencao(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ         *ðððð*\nââ¯\nâ\nââ¤ ð¤ ${nome}\nââ¤ ð Nota: *${nota.toFixed(1)}/10*\nââ¤ ð« AvaliaÃ§Ã£o: *${avaliacao}*\nâ\nâââ¢âà¼ºðà¼»ââ¢ââ`, pessoa);
}


// ============================================================
// ð¡ï¸ ADMINISTRAÃÃO AVANÃADA
// ============================================================

function obterConfiguracaoPersistente(config) {
    if (!config) return config;
    if (!Array.isArray(config.comandosAdmin)) config.comandosAdmin = [];
    config.comandosAdmin = [...new Set(config.comandosAdmin.map(x => String(x || '').trim().toLowerCase()).filter(Boolean))];
    if (!config.advertencias || typeof config.advertencias !== 'object' || Array.isArray(config.advertencias)) config.advertencias = {};
    if (!Array.isArray(config.anotacoes)) config.anotacoes = [];
    if (!('horarioAbertura' in config)) config.horarioAbertura = null;
    if (!('horarioFechamento' in config)) config.horarioFechamento = null;
    if (!('ultimoHorarioGrupo' in config)) config.ultimoHorarioGrupo = null;
    return config;
}

function formatarHoraConfig(hora) {
    return hora || 'nÃ£o configurado';
}


async function comandoParceria(message, acao='listar', argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const config=obterConfiguracaoPersistente(obterConfigAdmin(message.from));
    if (!Array.isArray(config.parcerias)) config.parcerias=[];
    const args=String(argumentos||'').trim();
    if(acao==='adicionar'){if(!args){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}add_parceria nome | contato/link*.`);return;}const partes=args.split('|');const nome=String(partes.shift()||'').trim();const valor=partes.join('|').trim();if(!nome||!valor){await responderCitando(message,'â Informe *nome | contato/link* para a parceria.');return;}const item={id:Date.now(),nome,valor,autor:obterIdRemetente(message),data:new Date().toISOString()};config.parcerias.push(item);salvarConfigAdmin();registrarLogAdmin(message,'add_parceria',nome);await responderCitando(message,`ð¤ *Parceria adicionada:* ${nome}\nð ${valor}\nð ${item.id}`);return;}
    if(acao==='remover'){const id=Number(args);const antes=config.parcerias.length;config.parcerias=config.parcerias.filter(x=>x.id!==id);salvarConfigAdmin();registrarLogAdmin(message,'del_parceria',args);await responderCitando(message,antes!==config.parcerias.length?'ðï¸ *Parceria removida.*':'â _ID de parceria nÃ£o encontrado._');return;}
    if(acao==='modo'){const v=args.toLowerCase();if(!['on','off'].includes(v)){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}modoparceria on/off*.`);return;}config.modoParceria=v==='on';salvarConfigAdmin();registrarLogAdmin(message,'modoparceria',v);await responderCitando(message,`ð¤ *Modo parceria*: ${config.modoParceria?'ð¢ ATIVO':'ð´ INATIVO'}`);return;}
    const lista=config.parcerias;await responderCitando(message,`âââ¢âà¼ºð¤à¼»ââ¢ââ\nâ *ððððððððð*\nââ¯\n${lista.length?lista.map((x,i)=>`ââ¤ *${i+1}.* ${x.nome}\nâ   ð ${x.valor}\nâ   ð ${x.id}`).join('\\n'):'ââ¤ _Nenhuma parceria cadastrada._'}\nââ¯\nââ¤ Modo: *${config.modoParceria?'ð¢ ATIVO':'ð´ INATIVO'}*\nâââ¢âà¼ºð¤à¼»ââ¢ââ`);
}

async function comandoSorteioAvancado(message,tipo,argumentos=''){
    if(!(await exigirAdmin(message)))return;if(sorteiosGrupos.has(message.from)){await responderCitando(message,'â ï¸ JÃ¡ existe um sorteio ativo neste grupo.');return;}
    const partes=String(argumentos||'').trim().split(/\s+/);const dur=parseDuracao(partes.shift());if(!dur){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}${tipo} 10m prÃªmio${tipo==='sorteio2'?' 2':''}*.`);return;}
    let quantidade=tipo==='sorteio2'?2:1;if(tipo==='sorteio2'&&/^\d+$/.test(partes.at(-1)||''))quantidade=Math.max(1,Math.min(10,Number(partes.pop())));const premio=partes.join(' ')||(tipo==='sorteiogold'?'PrÃªmio Gold':'PrÃªmio surpresa');const dados={premio,participantes:new Set(),fim:Date.now()+dur,quantidade};sorteiosGrupos.set(message.from,dados);
    await responderCitando(message,`ð *SORTEIO ESPECIAL ABERTO!*\n\nPrÃªmio: *${premio}*\nDuraÃ§Ã£o: *${Math.round(dur/60000)||1} min*\nGanhadores: *${quantidade}*\nParticipe com *${obterPrefixoGrupo(message.from)}participar*`);
    dados.timer=setTimeout(async()=>{const atual=sorteiosGrupos.get(message.from);if(!atual)return;sorteiosGrupos.delete(message.from);const pool=[...atual.participantes],vencedores=[];while(pool.length&&vencedores.length<atual.quantidade)vencedores.push(pool.splice(crypto.randomInt(pool.length),1)[0]);if(!vencedores.length){await client.sendMessage(message.from,'ð Sorteio encerrado sem participantes.');return;}const linhas=vencedores.map((id,i)=>`ââ¤ ${i+1}. @${String(id).split('@')[0]}`).join('\\n');await enviarComMencoes(message.from,`ð *SORTEIO ENCERRADO!*\n\nð PrÃªmio: *${atual.premio}*\n${linhas}`,{mentions:vencedores});},dur);
}

async function comandoAnagramaAdmin(message,argumentos=''){
    if(!(await exigirAdmin(message)))return;const palavra=String(argumentos||'').trim();if(!palavra){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}anagrama palavra*.`);return;}const chars=[...palavra];for(let i=chars.length-1;i>0;i--){const j=crypto.randomInt(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}await responderCitando(message,`ð¤ *ANAGRAMA*\n\nPalavra: *${palavra}*\nEmbaralhada: *${chars.join('')}*`);
}

async function comandoPermissaoComandoAdmin(message, acao, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfiguracaoPersistente(obterConfigAdmin(message.from));
    const prefixo = obterPrefixoGrupo(message.from);
    const nome = String(argumentos || '').trim().split(/\s+/)[0].replace(/^\W+/, '').toLowerCase();
    const protegidos = new Set(['addcmdadm','addcmdadmin','delcmdadm','delcmdadmin','listcmdadm','listcmdadmin','config','conf','soadm']);

    if (acao === 'listar') {
        const lista = config.comandosAdmin || [];
        await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ *ðððððððð ððððððððð*\nââ¯\n${lista.length ? lista.map((x,i)=>`ââ¤ ${i+1}. *${prefixo}${x}*`).join('\n') : 'ââ¤ _Nenhum comando adicional foi restrito._'}\nââ¯\nâ _Esses comandos exigem que o usuÃ¡rio seja administrador._\nâââ¢âà¼ºðà¼»ââ¢ââ`);
        return;
    }

    if (!nome || !/^[a-z0-9_+\-]{1,40}$/i.test(nome)) {
        const exemplo = acao === 'adicionar' ? `${prefixo}addcmdadm figurinha` : `${prefixo}delcmdadm figurinha`;
        await responderCitando(message, `â _Informe apenas o nome do comando._\n\nExemplo: *${exemplo}*`);
        return;
    }
    if (protegidos.has(nome)) {
        await responderCitando(message, 'ð _Esse comando jÃ¡ Ã© protegido pelo sistema administrativo e nÃ£o pode ser alterado por esta lista._');
        return;
    }

    if (acao === 'adicionar') {
        if (config.comandosAdmin.includes(nome)) {
            await responderCitando(message, `â¹ï¸ *${prefixo}${nome}* jÃ¡ estÃ¡ restrito aos administradores.`);
            return;
        }
        config.comandosAdmin.push(nome);
        salvarConfigAdmin();
        registrarLogAdmin(message, 'addcmdadm', nome);
        await responderCitando(message, `ð *${prefixo}${nome}* agora sÃ³ pode ser usado por administradores.`);
        return;
    }

    const antes = config.comandosAdmin.length;
    config.comandosAdmin = config.comandosAdmin.filter(x => x !== nome);
    salvarConfigAdmin();
    registrarLogAdmin(message, 'delcmdadm', nome);
    await responderCitando(message, antes !== config.comandosAdmin.length ? `ð *${prefixo}${nome}* voltou a poder ser usado por qualquer membro.` : `â ï¸ *${prefixo}${nome}* nÃ£o estava na lista de comandos restritos.`);
}

async function comandoConfigAdmin(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const grupo = message.from;
    const config = obterConfiguracaoPersistente(obterConfigAdmin(grupo));
    const args = String(argumentos || '').trim();
    const prefixo = obterPrefixoGrupo(grupo);
    const estado = v => v ? 'ð¢' : 'ð´';

    if (!args) {
        await reagir(message, 'âï¸');
        await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ
â  *âï¸ ððððððððððÌ§ðÌð*
ââ¯
â
â  ð¡ï¸ *ðððððððÌ§ðÌð*
â
ââ¤ *${prefixo}config antilink on/off*
â   _Bloquear links no grupo_
â
ââ¤ *${prefixo}config antiflood on/off*
â   _Limitar excesso de mensagens_
â
ââ¤ *${prefixo}config antimencao on/off*
â   _Bloquear marcaÃ§Ãµes_
â
ââ¤ *${prefixo}config antipalavra on/off*
â   _Bloquear palavras cadastradas_
â
ââ¤ *${prefixo}config autoban on/off*
â   _Expulsar automaticamente em infraÃ§Ãµes_
â
ââ¤ *${prefixo}config limitexto on/off*
â   _Limitar tamanho das mensagens_
â
ââ¯
â  ð¼ï¸ *ððððððð ðð ððÌððð*
â
ââ¤ *${prefixo}config antiimg on/off*
ââ¤ *${prefixo}config antivideo on/off*
ââ¤ *${prefixo}config antiaudio on/off*
ââ¤ *${prefixo}config antidoc on/off*
ââ¤ *${prefixo}config antisticker on/off*
ââ¤ *${prefixo}config anticatalogo on/off*
â   _Ativar ou bloquear cada tipo de mÃ­dia_
â
ââ¯
â  ð *ððððððð ð ðððÌðð*
â
ââ¤ *${prefixo}config welcome on/off*
â   _Mensagem de entrada_
â
ââ¤ *${prefixo}config goodbye on/off*
â   _Mensagem de saÃ­da_
â
ââ¯
â  ð® *ðððððððð*
â
ââ¤ *${prefixo}config jogos on/off*
ââ¤ *${prefixo}config economia on/off*
ââ¤ *${prefixo}config xp on/off*
ââ¤ *${prefixo}config cmds on/off*
â   _Ativar ou desativar sistemas do grupo_
â
ââ¯
â  ð  *ððððð*
â
ââ¤ *${prefixo}config multiprefix on/off*
â   _Aceitar mais de um prefixo_
â
ââ¤ *${prefixo}prefixo*
â   _Consultar/configurar o prefixo_
â
ââ¤ *${prefixo}regras*
â   _Consultar as regras do grupo_
â
ââ¤ *${prefixo}logs on/off*
â   _Registrar aÃ§Ãµes administrativas_
â
ââ¯
â  ð *ðððððð ð ððððððð*
â
ââ¤ *${prefixo}config palavra add <palavra>*
ââ¤ *${prefixo}config palavra remove <palavra>*
ââ¤ *${prefixo}config palavra list*
â
ââ¤ *${prefixo}config whitelist add @pessoa*
ââ¤ *${prefixo}config whitelist remove @pessoa*
ââ¤ *${prefixo}config whitelist list*
â
ââ¤ *${prefixo}config limite <nÃºmero>*
ââ¤ *${prefixo}config flood <nÃºmero>*
â
ââ¯
â  ð *ððððÌðððð*
â
ââ¤ *${prefixo}opengp 06:00*
ââ¤ *${prefixo}closegp 22:00*
ââ¤ *${prefixo}time-status*
ââ¤ *${prefixo}rm_opengp*
â
ââ¯
â  ð¡ *ðððððððð*
â
ââ¤ *${prefixo}config moderacao*
ââ¤ *${prefixo}config midia*
ââ¤ *${prefixo}config entrada*
ââ¤ *${prefixo}config sistemas*
ââ¤ *${prefixo}config grupo*
ââ¤ *${prefixo}config listas*
â
âââ¢âà¼ºâï¸à¼»ââ¢ââ`);
        return;
    }

    let chave = args.toLowerCase();
    const secoes = {
        moderacao: `âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ
â       *ðððððððÌ§ðÌð*
ââ¯
ââ¤ ð Antilink: *${estado(config.antilink)}*
ââ¤ ð¨ Antiflood: *${estado(config.antiflood)}* â¢ ${config.floodLimite}/10s
ââ¤ ð¥ Anti-menÃ§Ã£o: *${estado(config.antiMention)}*
ââ¤ ð¤¬ Antipalavra: *${estado(config.antiPalavra)}*
ââ¤ ð¨ Autoban: *${estado(config.autoBan)}*
ââ¤ ð Limite texto: *${estado(config.limitexto)}* â¢ ${config.limiteTexto}
âââ¢âà¼ºð¡ï¸à¼»ââ¢ââ`,
        mod: null,
        midia: `âââ¢âà¼ºð¼ï¸à¼»ââ¢ââ
â       *ððððððð ðð ððÌððð*
ââ¯
ââ¤ ð¼ï¸ Imagem: *${estado(config.antiImg)}*
ââ¤ ð¥ VÃ­deo: *${estado(config.antiVideo)}*
ââ¤ ðµ Ãudio: *${estado(config.antiAudio)}*
ââ¤ ð Documento: *${estado(config.antiDoc)}*
ââ¤ ð§© Figurinha: *${estado(config.antiSticker)}*
ââ¤ ðï¸ CatÃ¡logo: *${estado(config.antiCatalogo)}*
âââ¢âà¼ºð¼ï¸à¼»ââ¢ââ`,
        entrada: `âââ¢âà¼ºðà¼»ââ¢ââ
â       *ððððððð / ðððÌðð*
ââ¯
ââ¤ ð Welcome: *${estado(config.welcome)}*
ââ¤ ðª Goodbye: *${estado(config.goodbye)}*
ââ¤ ð Welcome: _${String(config.welcomeTexto || '').slice(0,80)}_
ââ¤ ð Goodbye: _${String(config.goodbyeTexto || '').slice(0,80)}_
âââ¢âà¼ºðà¼»ââ¢ââ`,
        grupo: `âââ¢âà¼ºð à¼»ââ¢ââ
â       *ððððð*
ââ¯
ââ¤ ð£ Prefixo: *${prefixo}*
ââ¤ ð£ Multiprefix: *${estado(config.multiprefix)}*
ââ¤ ð Regras: *${config.regras ? 'ð¢' : 'ð´'}*
ââ¤ ð Logs: *${estado(config.logs)}*
ââ¤ ð Abertura: *${formatarHoraConfig(config.horarioAbertura)}*
ââ¤ ð Fechamento: *${formatarHoraConfig(config.horarioFechamento)}*
âââ¢âà¼ºð à¼»ââ¢ââ`,
        sistemas: `âââ¢âà¼ºð®à¼»ââ¢ââ
â       *ðððððððð*
ââ¯
ââ¤ ð® Jogos: *${estado(config.jogos)}*
ââ¤ ð° Economia: *${estado(config.economia)}*
ââ¤ â­ XP: *${estado(config.xp)}*
âââ¢âà¼ºð®à¼»ââ¢ââ`,
        listas: `âââ¢âà¼ºðà¼»ââ¢ââ
â       *ðððððð*
ââ¯
ââ¤ ð¢ Lista branca: *${Array.isArray(config.listaBranca) ? config.listaBranca.length : 0}*
ââ¤ ð¤¬ Palavras bloqueadas: *${Array.isArray(config.palavrasProibidas) ? config.palavrasProibidas.length : 0}*
ââ¤ â ï¸ AdvertÃªncias registradas: *${Object.values(config.advertencias || {}).reduce((n,v)=>n+(v?.length||0),0)}*
ââ¤ ð AnotaÃ§Ãµes: *${config.anotacoes.length}*
âââ¢âà¼ºðà¼»ââ¢ââ`
    };
    if (chave === 'mod') chave = 'moderacao';
    if (secoes[chave]) { await responderCitando(message, secoes[chave]); return; }

    const partes = args.split(/\s+/);
    const alvo = String(partes.shift() || '').toLowerCase();
    const valor = partes.join(' ').trim();
    const bool = v => ['on','sim','true','1','ativar','ativado'].includes(String(v).toLowerCase()) ? true : ['off','nao','nÃ£o','false','0','desativar','desativado'].includes(String(v).toLowerCase()) ? false : null;
    const mapa = {antilink:'antilink',antiflood:'antiflood',antimencao:'antiMention',antipalavra:'antiPalavra',autoban:'autoBan',antiimg:'antiImg',antivideo:'antiVideo',antiaudio:'antiAudio',antidoc:'antiDoc',antisticker:'antiSticker',anticatalogo:'antiCatalogo',limitexto:'limitexto',multiprefix:'multiprefix',jogos:'jogos',economia:'economia',xp:'xp',cmds:'cmds',logs:'logs'};
    if (mapa[alvo]) {
        const b=bool(valor);
        if (b !== null) { config[mapa[alvo]]=b; salvarConfigAdmin(); await reagir(message,b?'ð¢':'ð´'); await responderCitando(message,`âââ¢âà¼ºâï¸à¼»ââ¢ââ\nââ¤ *${alvo}*: ${b?'ð¢ ATIVADO':'ð´ DESATIVADO'}\nâââ¢âà¼ºâï¸à¼»ââ¢ââ`); return; }
    }
    if (alvo === 'antiflood' && /^limite\s+/i.test(valor)) { const n=Number(valor.replace(/^limite\s+/i,'')); if(Number.isInteger(n)&&n>=3&&n<=30){config.floodLimite=n;salvarConfigAdmin();await responderCitando(message,`ð¨ *Limite do antiflood:* ${n} mensagens / 10s`);return;} }
    if (alvo === 'limitexto' && /^limite\s+/i.test(valor)) { const n=Number(valor.replace(/^limite\s+/i,'')); if(Number.isInteger(n)&&n>=100&&n<=10000){config.limiteTexto=n;salvarConfigAdmin();await responderCitando(message,`ð *Limite de texto:* ${n} caracteres`);return;} }
    if (alvo === 'palavra') {
        const op=String(partes.shift()||'').toLowerCase(); const palavra=partes.join(' ').trim().toLowerCase();
        if(op==='add'&&palavra){if(!config.palavrasProibidas.includes(palavra))config.palavrasProibidas.push(palavra);config.antiPalavra=true;salvarConfigAdmin();await responderCitando(message,`ð¤¬ Palavra *${palavra}* adicionada e filtro ativado.`);return;}
        if(op==='remove'&&palavra){config.palavrasProibidas=config.palavrasProibidas.filter(x=>x!==palavra);salvarConfigAdmin();await responderCitando(message,`ðï¸ Palavra *${palavra}* removida.`);return;}
        if(op==='list'){await responderCitando(message,`âââ¢âà¼ºð¤¬à¼»ââ¢ââ\nâ *ðððððððð ðððððððððð*\nââ¯\n${config.palavrasProibidas.length?config.palavrasProibidas.map((x,i)=>`ââ¤ ${i+1}. ${x}`).join('\n'):'ââ¤ _Nenhuma._'}\nâââ¢âà¼ºð¤¬à¼»ââ¢ââ`);return;}
    }
    if (alvo === 'whitelist') {
        const op=String(partes.shift()||'').toLowerCase();
        const pessoa=await obterAlvoComContato(message,false); const id=pessoa?idDaPessoa(pessoa):null;
        if(op==='add'&&id){if(!config.listaBranca.includes(id))config.listaBranca.push(id);salvarConfigAdmin();await responderCitando(message,`ð¢ @${id.split('@')[0]} foi adicionado Ã  lista branca.`,{mentions:[id]});return;}
        if(op==='remove'&&id){config.listaBranca=config.listaBranca.filter(x=>x!==id);salvarConfigAdmin();await responderCitando(message,`ðï¸ @${id.split('@')[0]} foi removido da lista branca.`,{mentions:[id]});return;}
        if(op==='list'){await enviarComMencoes(message.from,`âââ¢âà¼ºð¢à¼»ââ¢ââ\nâ *ððððð ðððððð*\nââ¯\n${config.listaBranca.length?config.listaBranca.map(id=>`ââ¤ @${String(id).split('@')[0]}`).join('\n'):'ââ¤ _Nenhuma pessoa cadastrada._'}\nâââ¢âà¼ºð¢à¼»ââ¢ââ`,{mentions:config.listaBranca,quotedMessageId:obterIdMensagem(message)});return;}
    }
    await responderCitando(message,`â _ConfiguraÃ§Ã£o nÃ£o encontrada._\n\nUse *${prefixo}config* para ver as categorias.`);
}

async function comandoAdvertencia(message, acao, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const config=obterConfiguracaoPersistente(obterConfigAdmin(message.from));
    const args=String(argumentos||'').trim();
    if (acao==='adverter') {
        const pessoa=await obterAlvoComContato(message,true); if(!pessoa)return;
        const id=idDaPessoa(pessoa); const motivo=args||'Sem motivo informado';
        if(!id)return;
        if(!config.advertencias[id])config.advertencias[id]=[];
        config.advertencias[id].push({motivo,admin:obterIdRemetente(message),data:new Date().toISOString()});
        salvarConfigAdmin(); registrarLogAdmin(message,'adverter',id);
        await enviarComMencoes(message.from,`âââ¢âà¼ºâ ï¸à¼»ââ¢ââ\nâ      *ðððððððÌðððð*\nââ¯\nââ¤ ð¤ @${id.split('@')[0]}\nââ¤ ð¢ Total: *${config.advertencias[id].length}*\nââ¤ ð Motivo: _${motivo}_\nâââ¢âà¼ºâ ï¸à¼»ââ¢ââ`,{mentions:[id],quotedMessageId:obterIdMensagem(message)});return;
    }
    if(acao==='ver_adv'){
        const pessoa=await obterAlvoComContato(message,true);if(!pessoa)return;const id=idDaPessoa(pessoa);const lista=config.advertencias[id]||[];
        await responderCitando(message,`âââ¢âà¼ºâ ï¸à¼»ââ¢ââ\nâ      *ðððððððÌððððð*\nââ¯\nââ¤ ð¤ @${id.split('@')[0]}\nââ¤ ð¢ Total: *${lista.length}*\n${lista.length?lista.map((x,i)=>`ââ¤ ${i+1}. _${x.motivo}_ â¢ ${new Date(x.data).toLocaleDateString('pt-BR')}`).join('\n'):'ââ¤ _Nenhuma advertÃªncia._'}\nâââ¢âà¼ºâ ï¸à¼»ââ¢ââ`,{mentions:[id]});return;
    }
    if(acao==='rm_adv'){
        const pessoa=await obterAlvoComContato(message,true);if(!pessoa)return;const id=idDaPessoa(pessoa);const n=Number(args)||1;const lista=config.advertencias[id]||[];lista.splice(0,Math.min(n,lista.length));if(!lista.length)delete config.advertencias[id];salvarConfigAdmin();await responderCitando(message,`ðï¸ *${n} advertÃªncia(s)* removida(s) de @${id.split('@')[0]}.`,{mentions:[id]});return;
    }
    if(acao==='limpar_adv'){
        config.advertencias={};salvarConfigAdmin();await responderCitando(message,'ð§¹ *Todas as advertÃªncias deste grupo foram apagadas.*');return;
    }
    const entradas=Object.entries(config.advertencias);
    await enviarComMencoes(message.from,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ      *ððððð ðð ðððððððÌððððð*\nââ¯\n${entradas.length?entradas.map(([id,l])=>`ââ¤ @${id.split('@')[0]} â¢ *${l.length}*`).join('\n'):'ââ¤ _Nenhuma advertÃªncia registrada._'}\nâââ¢âà¼ºðà¼»ââ¢ââ`,{mentions:entradas.map(x=>x[0]),quotedMessageId:obterIdMensagem(message)});
}

async function comandoAnotacao(message, acao, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const config=obterConfiguracaoPersistente(obterConfigAdmin(message.from)); const args=String(argumentos||'').trim();
    if(acao==='anotar'){
        if(!args){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}anotar tÃ­tulo | texto*.`);return;}
        const [titulo,...rest]=args.split('|');const texto=rest.join('|').trim()||titulo.trim();config.anotacoes.push({id:Date.now(),titulo:titulo.trim(),texto,autor:obterIdRemetente(message),data:new Date().toISOString()});salvarConfigAdmin();await responderCitando(message,`ð *AnotaÃ§Ã£o salva:* ${titulo.trim()}`);return;
    }
    if(acao==='rmnota'){const id=Number(args);const antes=config.anotacoes.length;config.anotacoes=config.anotacoes.filter(n=>n.id!==id);salvarConfigAdmin();await responderCitando(message,antes!==config.anotacoes.length?'ðï¸ *AnotaÃ§Ã£o removida.*':'â _ID de anotaÃ§Ã£o nÃ£o encontrado._');return;}
    await responderCitando(message,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððððÌ§ðÌðð*\nââ¯\n${config.anotacoes.length?config.anotacoes.map((n,i)=>`ââ¤ *${i+1}.* ${n.titulo}\nâ   ð ${n.id}\nâ   _${n.texto}_`).join('\n'): 'ââ¤ _Nenhuma anotaÃ§Ã£o._'}\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoPalavraAdmin(message, acao, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfiguracaoPersistente(obterConfigAdmin(message.from));
    const palavra = String(argumentos || '').trim().toLowerCase();
    if (acao === 'listar') {
        const lista = config.palavrasProibidas || [];
        await responderCitando(message, `âââ¢âà¼ºð¤¬à¼»ââ¢ââ\nâ *ðððððððð ðððððððððð*\nââ¯\n${lista.length ? lista.map((p,i)=>`ââ¤ ${i+1}. ${p}`).join('\\n') : 'ââ¤ _Nenhuma palavra cadastrada._'}\nâââ¢âà¼ºð¤¬à¼»ââ¢ââ`); return;
    }
    if (!palavra) { await responderCitando(message, `â Use *${obterPrefixoGrupo(message.from)}${acao === 'adicionar' ? 'add_palavra' : 'rm_palavra'} palavra*.`); return; }
    if (acao === 'adicionar') {
        if (!config.palavrasProibidas.includes(palavra)) config.palavrasProibidas.push(palavra);
        config.antiPalavra = true; salvarConfigAdmin();
        await responderCitando(message, `ð¤¬ *${palavra}* adicionada Ã  lista de palavras bloqueadas.`); return;
    }
    const antes = config.palavrasProibidas.length;
    config.palavrasProibidas = config.palavrasProibidas.filter(p => p !== palavra);
    salvarConfigAdmin();
    await responderCitando(message, antes !== config.palavrasProibidas.length ? `ðï¸ *${palavra}* removida da lista.` : `â ï¸ *${palavra}* nÃ£o estava cadastrada.`);
}

async function comandoPrefixos(message) {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from);
    await responderCitando(message, `âââ¢âà¼ºð£à¼»ââ¢ââ\nâ *ðððððððð*\nââ¯\nââ¤ Prefixo do grupo: *${config.prefixo || PREFIXO}*\nââ¤ Prefixo padrÃ£o: *${PREFIXO}*\nââ¤ Multiprefix: *${config.multiprefix ? 'ð¢ ATIVO' : 'ð´ INATIVO'}*\nâââ¢âà¼ºð£à¼»ââ¢ââ`);
}

async function comandoListaBrancaAdmin(message, acao) {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfiguracaoPersistente(obterConfigAdmin(message.from));
    if (acao === 'listar') {
        const lista = config.listaBranca || [];
        await enviarComMencoes(message.from, `âââ¢âà¼ºð¢à¼»ââ¢ââ\nâ *ððððð ðððððð*\nââ¯\n${lista.length ? lista.map(x=>`ââ¤ @${String(x).split('@')[0]}`).join('\\n') : 'ââ¤ _Nenhuma pessoa cadastrada._'}\nâââ¢âà¼ºð¢à¼»ââ¢ââ`, {mentions:lista,quotedMessageId:obterIdMensagem(message)}); return;
    }
    const pessoa = await obterAlvoComContato(message, false); if (!pessoa) return;
    const ids = [...await obterIdsPessoa(pessoa), idDaPessoa(pessoa)].filter(Boolean);
    if (acao === 'adicionar') {
        for (const id of ids) if (!config.listaBranca.some(x=>idsIguais(x,id))) config.listaBranca.push(id);
        salvarConfigAdmin();
        await enviarComMencoes(message.from, `ð¢ @${String(idDaPessoa(pessoa)).split('@')[0]} foi adicionado Ã  lista branca.`, {mentions:[idDaPessoa(pessoa)],quotedMessageId:obterIdMensagem(message)}); return;
    }
    const antes=config.listaBranca.length;
    config.listaBranca=config.listaBranca.filter(x=>!ids.some(id=>idsIguais(x,id))); salvarConfigAdmin();
    await responderCitando(message, antes!==config.listaBranca.length?'ðï¸ Pessoa removida da lista branca.':'â ï¸ Pessoa nÃ£o estava na lista branca.');
}

async function comandoListaNegraAdmin(message, acao) {
    if (!(await exigirAdmin(message))) return;
    if (acao === 'listar') {
        const lista=[...blacklistMute];
        await enviarComMencoes(message.from, `âââ¢âà¼ºð«à¼»ââ¢ââ\nâ *ððððð ððððð*\nââ¯\n${lista.length?lista.map(x=>`ââ¤ @${String(x).split('@')[0]}`).join('\\n'):'ââ¤ _Nenhuma pessoa cadastrada._'}\nâââ¢âà¼ºð«à¼»ââ¢ââ`,{mentions:lista,quotedMessageId:obterIdMensagem(message)}); return;
    }
    const pessoa=await obterAlvoComContato(message,true); if(!pessoa)return;
    const ids=[...await obterIdsPessoa(pessoa),idDaPessoa(pessoa)].filter(Boolean); const antes=blacklistMute.size;
    for(const x of [...blacklistMute]) if(ids.some(id=>idsIguais(x,id))) blacklistMute.delete(x);
    salvarBlacklist();
    await responderCitando(message,antes!==blacklistMute.size?'ðï¸ Pessoa removida da lista negra.':'â ï¸ Pessoa nÃ£o estava na lista negra.');
}

async function comandoMsgAdm(message, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const texto=String(argumentos||'').trim(); if(!texto){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}msgadm mensagem*.`);return;}
    try {
        const admins=await client.pupPage.evaluate(grupoId=>{const Store=window.require('WAWebCollections');const chat=Store?.Chat?.get(grupoId);const p=chat?.groupMetadata?.participants;const arr=typeof p?.getModelsArray==='function'?p.getModelsArray():(p?.models||[]);return arr.filter(x=>x?.isAdmin||x?.isSuperAdmin).map(x=>x?.id?._serialized||'').filter(Boolean);},message.from);
        await enviarComMencoes(message.from,`âââ¢âà¼ºð¢à¼»ââ¢ââ\nâ *ðððððððð ððð*\nââ¯\nââ¤ ${texto}\nâââ¢âà¼ºð¢à¼»ââ¢ââ`,{mentions:admins,quotedMessageId:obterIdMensagem(message)});
    } catch(e){await responderCitando(message,`â NÃ£o consegui enviar a mensagem aos administradores.\n_${e.message}_`);}
}

async function comandoPromoverRebaixar(message, acao) {
    if (!(await exigirAdmin(message))) return;

    if (!message.from?.endsWith('@g.us')) {
        await responderCitando(message, 'â _Esse comando sÃ³ funciona em grupos._');
        return;
    }

    const pessoa = await obterAlvoComContato(message, true);
    if (!pessoa) return;

    const idAlvo = idDaPessoa(pessoa);
    const idsAlvo = [...await obterIdsPessoa(pessoa)];
    if (idAlvo && !idsAlvo.includes(idAlvo)) idsAlvo.unshift(idAlvo);

    if (!idAlvo) {
        await responderCitando(message, 'â _NÃ£o consegui identificar a pessoa selecionada._');
        return;
    }

    const idRemetente = obterIdRemetente(message);
    const botId = client.info?.wid?._serialized || null;

    if (idsAlvo.some(id => idsIguais(id, idRemetente))) {
        await responderCitando(message, 'ð¤¨ _VocÃª nÃ£o pode alterar o prÃ³prio cargo por este comando._');
        return;
    }

    if (botId && idsAlvo.some(id => idsIguais(id, botId))) {
        await responderCitando(message, 'ð¤ _Eu nÃ£o posso alterar meu prÃ³prio cargo._');
        return;
    }

    try {
        const resultado = await client.pupPage.evaluate(async (chatId, participantIds, acao) => {
            try {
                const chat = await window.WWebJS.getChat(chatId, { getAsModel: false });
                if (!chat || chat.id?.server !== 'g.us') {
                    return { ok: false, erro: 'Grupo nÃ£o encontrado no WhatsApp.' };
                }

                const participantes = chat.groupMetadata?.participants;
                if (!participantes) {
                    return { ok: false, erro: 'Os participantes do grupo nÃ£o estÃ£o disponÃ­veis.' };
                }

                const ids = [...new Set((participantIds || []).filter(Boolean).map(String))];
                const modelos = typeof participantes.getModelsArray === 'function'
                    ? participantes.getModelsArray()
                    : (Array.isArray(participantes.models) ? participantes.models : []);

                const normalizar = valor => valor?._serialized || valor?.$1 || valor?.toString?.() || '';
                const chaves = new Set(ids);

                for (const candidato of ids) {
                    try {
                        const convertido = await window.WWebJS.enforceLidAndPnRetrieval(candidato);
                        if (convertido?.lid?._serialized) chaves.add(convertido.lid._serialized);
                        if (convertido?.phone?._serialized) chaves.add(convertido.phone._serialized);
                    } catch {}
                }

                let participante = null;
                for (const modelo of modelos) {
                    const idModelo = normalizar(modelo?.id);
                    if (!idModelo) continue;
                    if (chaves.has(idModelo)) {
                        participante = modelo;
                        break;
                    }

                    try {
                        const convertido = await window.WWebJS.enforceLidAndPnRetrieval(idModelo);
                        const equivalentes = [
                            convertido?.lid?._serialized,
                            convertido?.phone?._serialized
                        ].filter(Boolean);
                        if (equivalentes.some(id => chaves.has(id))) {
                            participante = modelo;
                            break;
                        }
                    } catch {}
                }

                if (!participante) {
                    return { ok: false, erro: 'UsuÃ¡rio nÃ£o encontrado nos participantes do grupo.' };
                }

                if (acao === 'promover' && (participante.isAdmin || participante.isSuperAdmin)) {
                    return { ok: true, jaEstava: true };
                }

                if (acao === 'rebaixar' && !participante.isAdmin && !participante.isSuperAdmin) {
                    return { ok: true, jaEstava: true };
                }

                // Usa exatamente a mesma API interna que o prÃ³prio bot jÃ¡ usa
                // para remover participantes, apenas trocando a operaÃ§Ã£o.
                const ModifyParticipants = window.require('WAWebModifyParticipantsGroupAction');
                const metodo = acao === 'promover' ? 'promoteParticipants' : 'demoteParticipants';
                if (typeof ModifyParticipants?.[metodo] !== 'function') {
                    return { ok: false, erro: `A operaÃ§Ã£o ${metodo} nÃ£o existe nesta versÃ£o do WhatsApp Web.` };
                }

                await ModifyParticipants[metodo](chat, [participante]);
                return { ok: true };
            } catch (erro) {
                return { ok: false, erro: String(erro?.message || erro) };
            }
        }, message.from, idsAlvo, acao);

        if (!resultado?.ok) throw new Error(resultado?.erro || 'OperaÃ§Ã£o nÃ£o concluÃ­da.');

        await reagir(message, acao === 'promover' ? 'ð' : 'ð»');

        if (resultado.jaEstava) {
            await responderAlvoComMencao(
                message,
                `â¹ï¸ @${String(idAlvo).split('@')[0]} ${acao === 'promover' ? 'jÃ¡ Ã© administrador' : 'jÃ¡ nÃ£o Ã© administrador'}.`,
                pessoa
            );
            return;
        }

        await responderAlvoComMencao(
            message,
            `âââ¢âà¼º${acao === 'promover' ? 'ð' : 'ð»'}à¼»ââ¢ââ\nââ¤ @${String(idAlvo).split('@')[0]} foi *${acao === 'promover' ? 'promovido a administrador' : 'rebaixado'}*.\nâââ¢âà¼º${acao === 'promover' ? 'ð' : 'ð»'}à¼»ââ¢ââ`,
            pessoa
        );
    } catch (erro) {
        console.error(`â Erro ao ${acao}:`, erro);
        await reagir(message, 'â');
        await responderCitando(
            message,
            `âââ¢âà¼ºâà¼»ââ¢ââ\nâ *ððÌð ððð ðððððÌððð ${acao === 'promover' ? 'ðððððððð' : 'ðððððððð'}*\nââ¯\nââ¤ _${erro?.message || erro}_\nâââ¢âà¼ºâà¼»ââ¢ââ`
        );
    }
}

async function comandoMarcar(message, modo, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    if (!message.from?.endsWith('@g.us')) {
        await responderCitando(message, 'â _Esse comando sÃ³ funciona em grupos._');
        return;
    }

    try {
        const resultado = await client.pupPage.evaluate((chatId) => {
            try {
                const Store = window.require('WAWebCollections');
                const chat = Store?.Chat?.get(chatId);
                const participantes = chat?.groupMetadata?.participants;
                if (!participantes) return { erro: 'Participantes do grupo nÃ£o encontrados.' };
                const modelos = typeof participantes.getModelsArray === 'function'
                    ? participantes.getModelsArray()
                    : (Array.isArray(participantes.models) ? participantes.models : []);
                return {
                    ids: modelos.map(p => p?.id?._serialized || p?.id?.toString?.() || '').filter(Boolean)
                };
            } catch (erro) {
                return { erro: String(erro?.message || erro) };
            }
        }, message.from);

        if (resultado?.erro) throw new Error(resultado.erro);
        const botId = client.info?.wid?._serialized || '';
        const ids = [...new Set((resultado?.ids || []).filter(id => id && id !== botId))];
        if (!ids.length) {
            await responderCitando(message, 'â ï¸ _NÃ£o encontrei participantes para marcar._');
            return;
        }

        const corpo = String(argumentos || '').trim() || 'ð¢ *AtenÃ§Ã£o, pessoal!*';
        const prefixo = modo === 'hidetag' ? '' : 'ð¢ ';
        const texto = `${prefixo}${corpo}\n\n${ids.map(id => `@${String(id).split('@')[0]}`).join(' ')}`;
        await enviarComMencoes(message.from, aplicarEstiloMensagem(texto), {
            mentions: ids,
            quotedMessageId: obterIdMensagem(message)
        });
    } catch (erro) {
        console.error('â Erro ao marcar:', erro);
        await reagir(message, 'â');
        await responderCitando(message, `â _NÃ£o consegui marcar os participantes._\n_${erro?.message || erro}_`);
    }
}

function normalizarHorarioGrupo(valor) { const m=String(valor||'').trim().match(/^(\d{1,2}):(\d{2})$/); if(!m)return null; const h=Number(m[1]),min=Number(m[2]); return h>=0&&h<=23&&min>=0&&min<=59?`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`:null; }

async function comandoHorarioGrupo(message, tipo, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const config=obterConfiguracaoPersistente(obterConfigAdmin(message.from)); const valor=normalizarHorarioGrupo(argumentos);
    if(tipo==='remover'){config.horarioAbertura=null;config.horarioFechamento=null;config.ultimoHorarioGrupo=null;salvarConfigAdmin();await responderCitando(message,'ð *HorÃ¡rios automÃ¡ticos removidos.*');return;}
    if(tipo==='status'){await responderCitando(message,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððÌððð ðð ððððð*\nââ¯\nââ¤ ð Abertura: *${formatarHoraConfig(config.horarioAbertura)}*\nââ¤ ð Fechamento: *${formatarHoraConfig(config.horarioFechamento)}*\nâââ¢âà¼ºðà¼»ââ¢ââ`);return;}
    if(!valor){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}${tipo==='abertura'?'opengp':'closegp'} HH:MM*.`);return;}
    if(tipo==='abertura')config.horarioAbertura=valor;else config.horarioFechamento=valor;salvarConfigAdmin();await responderCitando(message,`ð *${tipo==='abertura'?'Abertura':'Fechamento'} automÃ¡tica:* ${valor}`);
}

async function verificarHorariosGrupos() {
    const agora=new Date(); const hora=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Sao_Paulo'});
    for(const [grupoId,configBase] of configuracoesAdminGrupos.entries()){
        const config=obterConfiguracaoPersistente(configBase); let acao=null;
        if(config.horarioAbertura===hora) acao='abrir';
        if(config.horarioFechamento===hora) acao='fechar';
        if(!acao || config.ultimoHorarioGrupo===`${hora}:${acao}`) continue;
        try { const chat=await client.getChatById(grupoId); if(!chat?.isGroup)continue; if(!chat.isGroup)continue; const bot=chat.participants?.find(p=>idsIguais(p.id?._serialized||String(p.id),client.info?.wid?._serialized||'')); if(bot && !bot.isAdmin)continue; if(typeof chat.setMessagesAdminsOnly==='function'){await chat.setMessagesAdminsOnly(acao==='fechar');} else continue; config.ultimoHorarioGrupo=`${hora}:${acao}`;salvarConfigAdmin();console.log(`ð Grupo ${grupoId}: ${acao}`); } catch(erro){console.error(`â ï¸ Erro no horÃ¡rio do grupo ${grupoId}:`,erro.message);}
    }
}

// ============================================================
// PROCESSADOR DE COMANDOS
// ============================================================


async function comandoToggleGrupo(message, tipo, valor) {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from);
    const estado = String(valor || '').toLowerCase();
    const ativo = ['on', 'sim', 'true', '1'].includes(estado);
    if (!['on','sim','true','1','off','nao','nÃ£o','false','0'].includes(estado)) {
        await responderCitando(message, `â Use *${obterPrefixoGrupo(message.from)}${tipo} on* ou *off*.`); return;
    }
    config[tipo] = ativo; salvarConfigAdmin(); registrarLogAdmin(message, tipo, ativo ? 'on' : 'off');
    await reagir(message, ativo ? 'ð¢' : 'ð´');
    await responderCitando(message, `âââ¢âà¼ºâï¸à¼»ââ¢ââ\nââ¯ *ððððððð ðððððððð*\nâ\nââ¤ ${tipo.toUpperCase()}: *${ativo ? 'ð¢ ATIVADO' : 'ð´ DESATIVADO'}*\nââ¤ _A configuraÃ§Ã£o foi salva neste grupo._\nâââ¢âà¼ºâï¸à¼»ââ¢ââ`);
}

async function comandoAntiLink(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from); const args = String(argumentos || '').trim();
    const [sub, ...resto] = args.split(/\s+/); const valor = resto.join(' ').trim();
    if (sub?.toLowerCase() === 'allow' && valor) {
        const dominio = valor.toLowerCase().replace(/^https?:\/\//,'').split('/')[0];
        if (!config.linksPermitidos.includes(dominio)) config.linksPermitidos.push(dominio);
        salvarConfigAdmin(); await responderCitando(message, `â *${dominio}* foi adicionado aos links permitidos.`); return;
    }
    if (sub?.toLowerCase() === 'remove' && valor) {
        config.linksPermitidos = config.linksPermitidos.filter(x => x !== valor.toLowerCase());
        salvarConfigAdmin(); await responderCitando(message, `ðï¸ *${valor}* removido da lista de links permitidos.`); return;
    }
    if (sub?.toLowerCase() === 'list') {
        await responderCitando(message, `ð *ððððð ðððððððððð*\n\n${config.linksPermitidos.length ? config.linksPermitidos.map((x,i)=>`${i+1}. ${x}`).join('\n') : '_Nenhum domÃ­nio cadastrado._'}`); return;
    }
    if (['on','off','sim','nÃ£o','nao'].includes(sub?.toLowerCase())) {
        config.antilink = ['on','sim'].includes(sub.toLowerCase()); salvarConfigAdmin();
        await responderCitando(message, `ð *Antilink ${config.antilink ? 'ATIVADO' : 'DESATIVADO'}.*`); return;
    }
    await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ðððððððð*\nâ\nââ¤ *${obterPrefixoGrupo(message.from)}antilink on/off*\nââ¤ *${obterPrefixoGrupo(message.from)}antilink allow youtube.com*\nââ¤ *${obterPrefixoGrupo(message.from)}antilink remove youtube.com*\nââ¤ *${obterPrefixoGrupo(message.from)}antilink list*\nâââ¢âà¼ºðà¼»ââ¢ââ`);
}

async function comandoAntiFlood(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from); const args = String(argumentos || '').trim().split(/\s+/);
    if (['on','off'].includes(args[0]?.toLowerCase())) { config.antiflood = args[0].toLowerCase() === 'on'; if (args[1]) config.floodLimite = Math.max(3, Math.min(30, Number(args[1]) || config.floodLimite)); salvarConfigAdmin(); await responderCitando(message, `ð¨ *Antiflood ${config.antiflood ? 'ATIVADO' : 'DESATIVADO'}.*\nââ¤ Limite: *${config.floodLimite} mensagens*`); return; }
    if (args[0] === 'limite' && args[1]) { config.floodLimite = Math.max(3, Math.min(30, Number(args[1]) || 8)); salvarConfigAdmin(); await responderCitando(message, `ð¨ Limite do antiflood: *${config.floodLimite} mensagens*.`); return; }
    await responderCitando(message, `ð¨ *${obterPrefixoGrupo(message.from)}antiflood on/off [limite]*`);
}

async function comandoWelcomeGoodbye(message, tipo, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from);
    const args = String(argumentos || '').trim();
    const chave = tipo === 'welcome' ? 'welcomeTexto' : 'goodbyeTexto';
    if (!args) { await responderCitando(message, `âââ¢âà¼º${tipo==='welcome'?'ð':'ðª'}à¼»ââ¢ââ\nââ¤ ${tipo==='welcome'?'Welcome':'Goodbye'}: *${config[tipo]?'ð¢ ON':'ð´ OFF'}*\nââ¤ ð _${config[chave]}_\nâââ¢âà¼º${tipo==='welcome'?'ð':'ðª'}à¼»ââ¢ââ`); return; }
    if (['on','off'].includes(args.toLowerCase())) { config[tipo]=args.toLowerCase()==='on'; salvarConfigAdmin(); await responderCitando(message,`ð *${tipo} ${config[tipo]?'ATIVADO':'DESATIVADO'}.*`); return; }
    config[chave]=args; salvarConfigAdmin(); await responderCitando(message,`â *Mensagem de ${tipo} atualizada.*\n\n_${args}_\n\nð¡ Use *@pessoa* para mencionar a pessoa.`);
}

async function comandoRegras(message, argumentos = '') {
    const config = obterConfigAdmin(message.from);
    if (!argumentos.trim()) { await responderCitando(message, config.regras ? `âââ¢âà¼ºðà¼»ââ¢ââ\nâ *ðððððð*\nâ\n${config.regras}\nâââ¢âà¼ºðà¼»ââ¢ââ` : 'ð _Nenhuma regra foi configurada ainda._'); return; }
    if (!(await exigirAdmin(message))) return;
    config.regras = argumentos.trim(); salvarConfigAdmin(); registrarLogAdmin(message,'setregras'); await responderCitando(message, 'â Regras do grupo atualizadas.');
}

async function comandoSetNome(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const nome = argumentos.trim(); if (!nome) { await responderCitando(message, `â Use *${obterPrefixoGrupo(message.from)}setnome Novo nome*.`); return; }
    try { const resultado = await client.pupPage.evaluate(async (id, novoNome) => { try { const Store=window.require('WAWebCollections'); const chat=Store?.Chat?.get(id); if (!chat) return {ok:false,erro:'Grupo nÃ£o encontrado.'}; if (typeof chat.setSubject==='function') { await chat.setSubject(novoNome); return {ok:true}; } if (chat.groupMetadata?.subject?.set) { chat.groupMetadata.subject.set(novoNome); return {ok:true}; } return {ok:false,erro:'MÃ©todo de nome indisponÃ­vel.'}; } catch(e){return {ok:false,erro:String(e?.message||e)}} }, message.from, nome); if (!resultado?.ok) throw new Error(resultado?.erro); registrarLogAdmin(message,'setnome',nome); await responderCitando(message, `â *Nome do grupo alterado.*\n\nð·ï¸ ${nome}`); } catch(e){ await responderCitando(message, `â NÃ£o consegui alterar o nome.\n_${e.message}_`); }
}

async function comandoDescricao(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    try { const resultado = await client.pupPage.evaluate(async id => { const Store=window.require('WAWebCollections'); const chat=Store?.Chat?.get(id); if (!chat) return {ok:false,erro:'Grupo nÃ£o encontrado.'}; return {ok:true,descricao:chat.groupMetadata?.description || chat.description || ''}; }, message.from); if (!resultado?.ok) throw new Error(resultado.erro); if (!argumentos.trim()) { await responderCitando(message, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ðððððððÌ§ðÌð ðð ððððð*\nâ\n${resultado.descricao || '_Sem descriÃ§Ã£o._'}\nâââ¢âà¼ºðà¼»ââ¢ââ`); return; } const desc=argumentos.trim(); const alterado=await client.pupPage.evaluate(async (id,descricao)=>{try{const Store=window.require('WAWebCollections');const chat=Store?.Chat?.get(id);if(!chat)return {ok:false,erro:'Grupo nÃ£o encontrado.'};if(typeof chat.setDescription==='function'){await chat.setDescription(descricao);return {ok:true};}return {ok:false,erro:'MÃ©todo de descriÃ§Ã£o indisponÃ­vel.'};}catch(e){return {ok:false,erro:String(e?.message||e)}}},message.from,desc); if(!alterado?.ok) throw new Error(alterado.erro); registrarLogAdmin(message,'desc'); await responderCitando(message,'â *DescriÃ§Ã£o do grupo atualizada.*'); } catch(e){ await responderCitando(message,`â NÃ£o consegui alterar a descriÃ§Ã£o.\n_${e.message}_`); }
}

async function comandoSetDescricao(message, argumentos = '') {
    if (!(await exigirAdmin(message))) return;
    const desc = argumentos.trim();
    if (!desc) { await responderCitando(message, `â Use *${obterPrefixoGrupo(message.from)}setdesc Nova descriÃ§Ã£o*.`); return; }
    try {
        const resultado = await client.pupPage.evaluate(async (id, descricao) => {
            try {
                const Store = window.require('WAWebCollections');
                const chat = Store?.Chat?.get(id);
                if (!chat) return { ok: false, erro: 'Grupo nÃ£o encontrado.' };
                if (typeof chat.setDescription === 'function') { await chat.setDescription(descricao); return { ok: true }; }
                return { ok: false, erro: 'MÃ©todo de descriÃ§Ã£o indisponÃ­vel.' };
            } catch (e) { return { ok: false, erro: String(e?.message || e) }; }
        }, message.from, desc);
        if (!resultado?.ok) throw new Error(resultado.erro);
        await responderCitando(message, 'â *DescriÃ§Ã£o do grupo atualizada.*');
    } catch (e) { await responderCitando(message, `â NÃ£o consegui alterar a descriÃ§Ã£o.\n_${e.message}_`); }
}

async function comandoSetFoto(message) {
    if (!(await exigirAdmin(message))) return;
    try { let alvo=message; if (message.hasQuotedMsg) alvo=await message.getQuotedMessage(); if (!alvo?.hasMedia) { await responderCitando(message,`ð¼ï¸ Responda a uma imagem com *${obterPrefixoGrupo(message.from)}setfoto*.`); return; } const media=await alvo.downloadMedia(); if (!media) throw new Error('NÃ£o consegui baixar a imagem.'); await client.setProfilePicture(message.from, media); registrarLogAdmin(message,'setfoto'); await responderCitando(message,'â *Foto do grupo atualizada.*'); } catch(e){ await responderCitando(message,`â NÃ£o consegui alterar a foto do grupo.\n_${e.message}_`); }
}

async function comandoStaff(message) {
    if (!(await exigirAdmin(message))) return;
    if (!message.from.endsWith('@g.us')) { await responderCitando(message,'â Esse comando sÃ³ funciona em grupos.'); return; }
    try { const dados=await client.pupPage.evaluate(id=>{const Store=window.require('WAWebCollections');const chat=Store?.Chat?.get(id);const p=chat?.groupMetadata?.participants;if(!p)return null;const arr=typeof p.getModelsArray==='function'?p.getModelsArray():(p.models||[]);return arr.filter(x=>x.isAdmin||x.isSuperAdmin).map(x=>({id:x.id?._serialized||'',owner:!!x.isSuperAdmin}));},message.from); if(!dados) throw new Error('NÃ£o consegui obter a equipe.'); const linhas=dados.map((x,i)=>`${x.owner?'ð':'ð¡ï¸'} *${i+1}.* @${x.id.split('@')[0]}`).join('\n'); await enviarComMencoes(message.from,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ *ððððð ðð ððððð*\nâ\n${linhas || '_Nenhum administrador encontrado._'}\nâââ¢âà¼ºðà¼»ââ¢ââ`,{mentions:dados.map(x=>x.id)}); } catch(e){ await responderCitando(message,`â NÃ£o consegui consultar a equipe.\n_${e.message}_`); }
}

async function obterPessoaAlvoAdmin(message, argumentos = '', usarRemetenteComoPadrao = false) {
    const mencionados = [...new Set(message?.mentionedIds || [])];
    if (mencionados.length) return mencionados[0];
    if (message?.hasQuotedMsg) {
        try {
            const citado = await message.getQuotedMessage();
            return citado?.author || citado?.from || null;
        } catch {}
    }
    const numero = String(argumentos || '').match(/\b\d{8,15}\b/)?.[0];
    if (numero) return `${numero}@c.us`;
    if (usarRemetenteComoPadrao) return obterIdRemetente(message);
    return null;
}

async function comandoDarXP(message, argumentos, remover = false) {
    if (!(await exigirAdmin(message))) return;
    const alvo = await obterPessoaAlvoAdmin(message, argumentos, true);
    const numeros = String(argumentos || '').match(/\b\d+\b/g) || [];
    const numeroAlvo = String(argumentos || '').match(/\b\d{8,15}\b/)?.[0];
    const qtd = Number(numeroAlvo ? (numeros.find(n => n !== numeroAlvo) ?? '') : (numeros[0] ?? ''));
    if (!alvo || !Number.isFinite(qtd) || qtd <= 0) { await responderCitando(message, `â Use *${obterPrefixoGrupo(message.from)}${remover ? 'removerxp' : 'darxp'} @pessoa 100*.`); return; }
    const atual = garantirDadosXP(message.from, alvo);
    atual.xp = Math.max(0, atual.xp + (remover ? -qtd : qtd));
    atual.nivel = calcularNivel(atual.xp);
    salvarXP();
    await responderCitando(message, `â­ *${remover ? 'XP REMOVIDO' : 'XP ADICIONADO'}*\n\nð¤ @${String(alvo).split('@')[0]}\nâ¤ ${remover ? '-' : '+'}${qtd} XP`);
}

async function comandoDarCoins(message, argumentos, remover = false) {
    if (!(await exigirAdmin(message))) return;
    const alvo=await obterPessoaAlvoAdmin(message,argumentos,true);
    const numeros = String(argumentos || '').match(/\b\d+\b/g) || [];
    const numeroAlvo = String(argumentos || '').match(/\b\d{8,15}\b/)?.[0];
    const qtd = Number(numeroAlvo ? (numeros.find(n => n !== numeroAlvo) ?? '') : (numeros[0] ?? '')); if(!alvo||!Number.isFinite(qtd)||qtd<=0){await responderCitando(message,`â Use *${obterPrefixoGrupo(message.from)}${remover?'removercoins':'darcoins'} @pessoa 100*.`);return;} const atual=moedasUsuarios.get(alvo)||{saldo:0}; atual.saldo=Math.max(0,atual.saldo+(remover?-qtd:qtd)); moedasUsuarios.set(alvo,atual); salvarMoedas(); await responderCitando(message,`ð° *${remover?'MOEDAS REMOVIDAS':'MOEDAS ADICIONADAS'}*\n\nð¤ @${String(alvo).split('@')[0]}\nâ¤ ${remover?'-':''}${qtd}`); }

async function comandoResetXP(message, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const alvo=await obterPessoaAlvoAdmin(message,argumentos);
    if (!alvo) {
        await responderCitando(message,`â Para resetar o XP, mencione a pessoa ou responda a uma mensagem dela.\n\nExemplo: *${obterPrefixoGrupo(message.from)}resetxp @pessoa*.`);
        return;
    }
    const grupo=dadosXP.get(message.from);
    if(grupo) grupo.delete(alvo);
    salvarXP();
    await responderCitando(message,`â»ï¸ XP de @${String(alvo).split('@')[0]} resetado.`);
}
async function comandoResetEco(message, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const alvo=await obterPessoaAlvoAdmin(message,argumentos);
    if(!alvo){
        await responderCitando(message,`â Para resetar a economia, mencione a pessoa ou responda a uma mensagem dela.\n\nExemplo: *${obterPrefixoGrupo(message.from)}reseteco @pessoa*.`);
        return;
    }
    moedasUsuarios.delete(alvo);
    salvarMoedas();
    await responderCitando(message,`â»ï¸ Economia de @${String(alvo).split('@')[0]} resetada.`);
}

async function comandoSorteio(message, argumentos='') {
    if (!(await exigirAdmin(message))) return;
    const partes=String(argumentos||'').trim().split(/\s+/); const dur=parseDuracao(partes.shift()); if(!dur){await responderCitando(message,`ð Use *${obterPrefixoGrupo(message.from)}sorteio 10m prÃªmio*.`);return;} if(sorteiosGrupos.has(message.from)){await responderCitando(message,'â ï¸ JÃ¡ existe um sorteio ativo.');return;} const premio=partes.join(' ')||'PrÃªmio surpresa'; const dados={premio,participantes:new Set(),fim:Date.now()+dur}; sorteiosGrupos.set(message.from,dados); await responderCitando(message,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ *ððððððð ðððððð!*\nâ\nââ¤ ð PrÃªmio: *${premio}*\nââ¤ â³ DuraÃ§Ã£o: *${Math.round(dur/60000)||1} min*\nââ¤ ðï¸ Participe com *${obterPrefixoGrupo(message.from)}participar*\nâââ¢âà¼ºðà¼»ââ¢ââ`); dados.timer=setTimeout(async()=>{const atual=sorteiosGrupos.get(message.from);if(!atual)return;const lista=[...atual.participantes];sorteiosGrupos.delete(message.from);if(!lista.length){await client.sendMessage(message.from,'ð Sorteio encerrado sem participantes.');return;}const vencedor=lista[crypto.randomInt(lista.length)];await enviarComMencoes(message.from,`ð *SORTEIO ENCERRADO!*\n\nð PrÃªmio: *${premio}*\nð Vencedor: @${String(vencedor).split('@')[0]}`,{mentions:[vencedor]});},dur); }
async function comandoParticiparSorteio(message){const s=sorteiosGrupos.get(message.from);if(!s){await responderCitando(message,'â NÃ£o hÃ¡ sorteio ativo.');return;}const id=obterIdRemetente(message);if(id)s.participantes.add(id);await responderCitando(message,'ðï¸ *VocÃª estÃ¡ participando do sorteio!*');}
async function comandoCancelarSorteio(message){if(!(await exigirAdmin(message)))return;const s=sorteiosGrupos.get(message.from);if(!s){await responderCitando(message,'â NÃ£o hÃ¡ sorteio ativo.');return;}clearTimeout(s.timer);sorteiosGrupos.delete(message.from);await responderCitando(message,'ð *Sorteio cancelado pelo administrador.*');}

async function comandoLimpar(message, argumentos='') { if (!(await exigirAdmin(message))) return; const qtd=Math.max(1,Math.min(50,Number(argumentos)||10)); try { if(message.hasQuotedMsg){const q=await message.getQuotedMessage();await q.delete(true);await responderCitando(message,'ð§¹ Mensagem apagada.');return;} const chat=await message.getChat(); const msgs=await chat.fetchMessages({limit:qtd+1}); let apagadas=0; for(const m of msgs){if(m.id?._serialized===message.id?._serialized)continue;try{await m.delete(true);apagadas++;}catch{}} await responderCitando(message,`ð§¹ *${apagadas} mensagem(ns) apagada(s).*`);}catch(e){await responderCitando(message,`â NÃ£o consegui limpar as mensagens.\n_${e.message}_`);} }

async function comandoLogs(message) { if(!(await exigirAdmin(message)))return; const c=obterConfigAdmin(message.from); const logs=logsAdminGrupos.get(message.from)||[]; if(!c.logs){await responderCitando(message,'ð _Os logs estÃ£o desativados. Use ;logs on._');return;} const texto=logs.slice(0,15).map(x=>`â¢ ${new Date(x.data).toLocaleString('pt-BR')} | ${x.acao} | @${x.autor.split('@')[0]} ${x.detalhes?'| '+x.detalhes:''}`).join('\n'); await enviarComMencoes(message.from,`âââ¢âà¼ºðà¼»ââ¢ââ\nâ *ðððð ððððð*\nâ\n${texto||'_Nenhuma aÃ§Ã£o registrada._'}\nâââ¢âà¼ºðà¼»ââ¢ââ`,{mentions:logs.slice(0,15).map(x=>x.autor)}); }

let agenteIA = null;

function obterAgenteIA() {
    if (!agenteIA) {
        agenteIA = criarAgenteIA({
            resolverIdEconomia,
            garantirCarteira,
            garantirDadosXP,
            calcularNivel
        });
    }
    return agenteIA;
}

async function obterContextoIA(message) {
    const alvos = {
        eu: obterIdRemetente(message),
        mencionado: null,
        respondido: null
    };

    try {
        const mencoes = await message.getMentions();
        if (mencoes?.length) {
            alvos.mencionado = idDaPessoa(mencoes[0]);
        }
    } catch (erro) {
        console.log('â ï¸ NÃ£o foi possÃ­vel obter menÃ§Ã£o para a IA:', erro?.message || erro);
    }

    if (message.hasQuotedMsg) {
        try {
            const citado = await message.getQuotedMessage();
            alvos.respondido = citado?.author || citado?.from || null;
        } catch (erro) {
            console.log('â ï¸ NÃ£o foi possÃ­vel obter mensagem respondida para a IA:', erro?.message || erro);
        }
    }

    return {
        grupoId: message.from,
        alvos
    };
}

async function comandoIA(message, argumentos = '') {
    const pergunta = String(argumentos || '').trim();

    if (!pergunta) {
        await responderCitando(
            message,
            `ð¤ _Digite o que vocÃª quer perguntar._\n\nExemplo: *${obterPrefixoGrupo(message.from)}ia quanto eu tenho de moedas?*`
        );
        return;
    }

if (!process.env.OPENAI_API_KEY) {
    await reagir(message, 'ð');
    await responderCitando(
        message,
        'ð _A IA ainda nÃ£o estÃ¡ configurada neste computador._\n\nDefina a variÃ¡vel de ambiente *OPENAI_API_KEY* e reinicie o bot.'
    );
    return;
}

    try {
        const contexto = await obterContextoIA(message);
        const resultado = await obterAgenteIA().responder(pergunta, contexto);

        if (!resultado?.sucesso || !resultado.texto) {
            throw new Error(resultado?.mensagem || 'Resposta vazia da IA.');
        }

        await reagir(message, 'ð¤');
        await responderCitando(message, resultado.texto);
    } catch (erro) {
        console.error('â Erro no comando IA:', erro);
        await reagir(message, 'â');
        await responderCitando(
            message,
            'â _NÃ£o consegui processar sua pergunta agora. Tente novamente em alguns instantes._'
        );
    }
}

function detectarViewOnce(mensagem) {
    const raw = mensagem?.rawData || mensagem?._data || {};
    const media = raw.mediaData || raw.media || {};
    return Boolean(mensagem?.isViewOnce || mensagem?.isViewOnceMessage || raw.isViewOnce || raw.isViewOnceMessage || raw.viewOnce || raw.viewOnceMessage || media.isViewOnce || media.viewOnce);
}

async function obterMensagemAlvoViewOnce(message) {
    if (message?.hasQuotedMsg) {
        try { return await message.getQuotedMessage(); } catch {}
    }
    return detectarViewOnce(message) ? message : null;
}

async function comandoRevelarViewOnce(message) {
    if (!(await exigirAdmin(message))) return;
    const alvo = await obterMensagemAlvoViewOnce(message);
    if (!alvo || !detectarViewOnce(alvo)) {
        await reagir(message, '👁️');
        await responderCitando(message, `┏═•❃༺👁️༻❃•═┓\n├✯ *𝐑𝐄𝐕𝐄𝐋𝐀𝐑 𝐕𝐈𝐄𝐖-𝐎𝐍𝐂𝐄*\n│\n├➤ Responda a uma imagem ou vídeo de visualização única.\n┗═•❃༺👁️༻❃•═┛`);
        return;
    }
    try {
        const midia = await baixarMidiaWhatsAppCompativel(alvo);
        if (!midia?.data) throw new Error('Mídia não disponível.');
        const legenda = String(alvo.body || '').trim();
        await client.sendMessage(message.from, midia, { caption: legenda ? `👁️ ${legenda}` : undefined });
        await reagir(message, '✅');
        await responderCitando(message, '👁️ *Visualização única recuperada e reenviada.*');
    } catch (erro) {
        console.error('⚠️ Erro ao revelar view-once:', erro);
        await reagir(message, '❌');
        await responderCitando(message, `❌ *Não foi possível recuperar a mídia.*\n\n_${formatarErroDownload(erro)}_`);
    }
}

async function comandoAutoresposta(message, argumentos) {
    if (!(await exigirAdmin(message))) return;
    const config = obterConfigAdmin(message.from);
    if (!Array.isArray(config.respostasAutomaticas)) config.respostasAutomaticas = [];
    const args = String(argumentos || '').trim();
    const partes = args.split(/\s+/).filter(Boolean);
    const acao = (partes.shift() || '').toLowerCase();
    if (['on','ativar','ativado','sim'].includes(acao)) { config.autoresposta=true; salvarConfigAdmin(); await responderCitando(message,'🤖 *Autoresposta ativada.*'); return; }
    if (['off','desativar','desativado','nao','não'].includes(acao)) { config.autoresposta=false; salvarConfigAdmin(); await responderCitando(message,'🤖 *Autoresposta desativada.*'); return; }
    if (['add','adicionar'].includes(acao)) {
        const conteudo=args.replace(/^\S+\s*/,''); const sep=conteudo.indexOf('|');
        if(sep<1){await responderCitando(message,`❌ Use *${obterPrefixoGrupo(message.from)}autoresposta add gatilho | resposta*.`);return;}
        const gatilho=conteudo.slice(0,sep).trim(), resposta=conteudo.slice(sep+1).trim();
        if(!gatilho||!resposta){await responderCitando(message,'❌ O gatilho e a resposta precisam ser preenchidos.');return;}
        const existente=config.respostasAutomaticas.find(x=>textoNormalizado(x.gatilho)===textoNormalizado(gatilho));
        if(existente) existente.resposta=resposta; else config.respostasAutomaticas.push({gatilho,resposta});
        config.autoresposta=true; salvarConfigAdmin(); await responderCitando(message,`🤖 *Autoresposta salva.*\n\nGatilho: *${gatilho}*\nResposta: _${resposta}_`); return;
    }
    if (['del','remover'].includes(acao)) {
        const gatilho=args.replace(/^\S+\s*/,'').trim(); const antes=config.respostasAutomaticas.length;
        config.respostasAutomaticas=config.respostasAutomaticas.filter(x=>textoNormalizado(x.gatilho)!==textoNormalizado(gatilho)); salvarConfigAdmin();
        await responderCitando(message,antes!==config.respostasAutomaticas.length?'🗑️ *Autoresposta removida.*':'❌ _Gatilho não encontrado._'); return;
    }
    if (['list','lista','listar'].includes(acao)) {
        const corpo=config.respostasAutomaticas.length?config.respostasAutomaticas.map((x,i)=>`├➤ *${i+1}.* ${x.gatilho} → _${x.resposta}_`).join('\n'):'├➤ _Nenhuma resposta cadastrada._';
        await responderCitando(message,`┏═•❃༺🤖༻❃•═┓\n│ *𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀𝐒*\n├✯\n${corpo}\n├✯\n├➤ Estado: *${config.autoresposta?'ATIVO':'INATIVO'}*\n┗═•❃༺🤖༻❃•═┓`); return;
    }
    await responderCitando(message,`🤖 *𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀*\n\n• ${obterPrefixoGrupo(message.from)}autoresposta on/off\n• ${obterPrefixoGrupo(message.from)}autoresposta add gatilho | resposta\n• ${obterPrefixoGrupo(message.from)}autoresposta del gatilho\n• ${obterPrefixoGrupo(message.from)}autoresposta list`);
}

async function processarAutoresposta(message) {
    if(!message?.from?.endsWith('@g.us')) return false;
    const config=obterConfigAdmin(message.from);
    if(!config.autoresposta||!Array.isArray(config.respostasAutomaticas)||!config.respostasAutomaticas.length)return false;
    const texto=textoNormalizado(message.body||'').trim();
    if(!texto||texto.startsWith(obterPrefixoGrupo(message.from)))return false;
    const regra=config.respostasAutomaticas.find(x=>{const gatilho=textoNormalizado(x.gatilho||'').trim();return gatilho&&(texto===gatilho||texto.includes(gatilho));});
    if(!regra)return false;
    await responderCitando(message,String(regra.resposta)); return true;
}


async function processarComando(
    message,
    comando,
    argumentos
) {

    // ð MODO SOMENTE ADM
    // O prÃ³prio ;soadm fica liberado para que um administrador
    // possa alternar o modo. Todos os demais comandos passam
    // pela verificaÃ§Ã£o global quando o modo estÃ¡ ativo.
    if (
        message?.from?.endsWith('@g.us') &&
        soAdmGrupos.has(message.from) &&
        comando !== 'soadm'
    ) {
        const admin = await usuarioEhAdminDoGrupo(message);

        if (!admin) {
            await reagir(message, 'ð');
            await responderCitando(
                message,
                'ð _Este grupo estÃ¡ no modo somente ADM. Apenas administradores podem usar os comandos._'
            );
            return;
        }
    }

    if (message?.from?.endsWith('@g.us')) {
        const config = obterConfigAdmin(message.from);
        const admin = await usuarioEhAdminDoGrupo(message);
        if (!admin && config.cmds === false && !['cmds','config','prefixo'].includes(comando)) {
            await responderCitando(message, 'ð _Os comandos estÃ£o desativados neste grupo pelos administradores._');
            return;
        }
        if (!admin && ['minerar','mina','loja','shop','comprar','buy','inventario','inv','doar','donate','sortearm','rankingdinheiro','rankingmoedas','ricos','slots','slot','saldo','carteira','roubar'].includes(comando) && !config.economia) {
            await responderCitando(message, 'ð° _O sistema de economia estÃ¡ desativado neste grupo._'); return;
        }
        if (!admin && ['dado','moeda','sn','ppt','adivinha','chute','chuterpg','quiz','pokemon','ppp','passar','batata','batataquente','hotpotato','rr','roletarussa','roleta','forca','revforca','stop'].includes(comando) && !config.jogos) {
            await responderCitando(message, 'ð® _Os jogos estÃ£o desativados neste grupo._'); return;
        }
    }

    if (message?.from?.endsWith('@g.us')) {
        const config = obterConfiguracaoPersistente(obterConfigAdmin(message.from));
        const restritos = Array.isArray(config.comandosAdmin) ? config.comandosAdmin : [];
        if (restritos.includes(String(comando || '').toLowerCase())) {
            const admin = await usuarioEhAdminDoGrupo(message);
            if (!admin) {
                await reagir(message, 'ð');
                await responderCitando(message, `ð _O comando_ *${obterPrefixoGrupo(message.from)}${comando}* _Ã© exclusivo para administradores deste grupo._`);
                return;
            }
        }
    }

    if (['config','antilink','antiflood','welcome','goodbye','setwelcome','setgoodbye','jogos','economia','xp','cmds','setregras','setnome','setfoto','desc','staff','darxp','removerxp','resetxp','darcoins','removercoins','reseteco','sorteio','cancelarsorteio','limpar','logs','prefixo','add_parceria','del_parceria','parceria','modoparceria','sorteio2','sorteiogold','anagrama'].includes(comando)) registrarLogAdmin(message, comando, argumentos);

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
    if (argumentos.trim()) await comandoToggleGrupo(message, 'jogos', argumentos);
    else await menuJogos(message);
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

        case 'passar':
            await passarBatataQuente(message);
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

        case 'forca':
            await jogarForca(message, argumentos);
            break;

        case 'revforca':
            await revelarForca(message);
            break;

        case 'stop':
            await jogarStop(message, argumentos);
            break;

        case 'gp':
            await configurarGrupoMensagens(message, argumentos);
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
        case 'abraÃ§ar':
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
    // ð Primeiro verifica se existe um divÃ³rcio aguardando confirmaÃ§Ã£o
    if (await aceitarDivorcio(message)) {
        break;
    }

    // ð Caso contrÃ¡rio, trata como proposta de casamento
    await aceitarCasamento(message);
    break;

case 'recusar':
    // ð Primeiro verifica se existe um divÃ³rcio aguardando confirmaÃ§Ã£o
    if (await recusarDivorcio(message)) {
        break;
    }

    // ð Caso contrÃ¡rio, trata como proposta de casamento
    await recusarCasamento(message);
    break;
        
    case 'ttg':
    case 'totag':
    case 'trtg':
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

    case 'ia':
    case 'inteligencia':
    case 'inteligenciaartificial':
    await comandoIA(message, argumentos);
    break;

    case 'perfil':
    await mostrarPerfil(message, argumentos);
    break;

    case 'ranking':
    await mostrarRanking(message);
    break;

    case 'ranklindo':
        await comandoRankVariado(message, 'ranklindo');
        break;
    case 'rankfeio':
        await comandoRankVariado(message, 'rankfeio');
        break;
    case 'rankgay':
        await comandoRankVariado(message, 'rankgay');
        break;
    case 'rankhetero':
    case 'rankhÃ©tero':
        await comandoRankVariado(message, 'rankhetero');
        break;
    case 'ranklesbico':
    case 'ranklÃ©sbico':
        await comandoRankVariado(message, 'ranklesbico');
        break;
    case 'rankinteligente':
        await comandoRankVariado(message, 'rankinteligente');
        break;
    case 'rankpobre':
        await comandoRankPobre(message);
        break;
    case 'rankship':
        await comandoRankShip(message);
        break;
    case 'csrank':
        await comandoRankCustomizado(message, argumentos);
        break;
    case 'srank':
        await configurarRanksPorComando(message, argumentos);
        break;
    case 'rfixo':
        await configurarModoRank(message, 'fixo');
        break;
    case 'raleatorio':
        await configurarModoRank(message, 'aleatorio');
        break;

case 'rankingfilhos':
case 'rankingfilho':
case 'filhosranking':
    await mostrarRankingFilhos(message);
    break;


        // ============================================================
        // MÃDIA
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
        // ð§° NOVAS UTILIDADES E DIVERSÃO
        // ============================================================

        case 'uptime':
            await comandoUptime(message);
            break;
        case 'status':
            await comandoStatus(message);
            break;
        case 'avatar':
            await comandoAvatar(message);
            break;
        case 'admins':
            await comandoAdmins(message);
            break;
        case 'id':
            await comandoId(message);
            break;
        case 'escolher':
            await comandoEscolher(message, argumentos);
            break;
        case 'contador':
            await comandoContador(message, argumentos);
            break;
        case 'cronometro':
            await comandoCronometro(message, argumentos);
            break;
        case 'calculadora':
            await comandoCalculadora(message, argumentos);
            break;
        case 'porcentagem':
            await comandoPorcentagem(message, argumentos);
            break;
        case 'regra3':
            await comandoRegra3(message, argumentos);
            break;
        case 'converter':
            await comandoConverter(message, argumentos);
            break;
        case 'cotacao':
            await comandoCotacao(message, argumentos);
            break;
        case 'traduzir':
            await comandoTraduzir(message, argumentos);
            break;
        case 'encurtar':
            await comandoEncurtar(message, argumentos);
            break;
        case 'verdade':
            await comandoVerdade(message);
            break;
        case 'desafio':
            await comandoDesafio(message);
            break;
        case 'vidente':
            await comandoVidente(message, argumentos);
            break;
        case '8ball':
            await comando8Ball(message, argumentos);
            break;
        case 'decidir':
            await comandoDecidir(message, argumentos);
            break;
        case 'crush':
            await comandoRelacaoAleatoria(message, 'crush');
            break;
        case 'amizade':
            await comandoRelacaoAleatoria(message, 'amizade');
            break;
        case 'inimigos':
            await comandoRelacaoAleatoria(message, 'inimigos');
            break;
        case 'fbi':
            await comandoFBI(message);
            break;
        case 'laudo':
            await comandoLaudo(message);
            break;
        case 'curriculo':
            await comandoCurriculo(message);
            break;
        case 'nota':
            await comandoNota(message);
            break;
        case 'level':
            await mostrarPerfil(message, argumentos);
            break;
        case 'rank':
            await mostrarRanking(message);
            break;

        case 'adverter': await comandoAdvertencia(message, 'adverter', argumentos); break;
        case 'rm_adv': case 'rmadv': await comandoAdvertencia(message, 'rm_adv', argumentos); break;
        case 'lista_adv': case 'listaadv': await comandoAdvertencia(message, 'lista_adv', argumentos); break;
        case 'ver_adv': case 'veradv': await comandoAdvertencia(message, 'ver_adv', argumentos); break;
        case 'limpar_adv': case 'limparadv': await comandoAdvertencia(message, 'limpar_adv', argumentos); break;
        case 'anotar': await comandoAnotacao(message, 'anotar', argumentos); break;
        case 'anotaÃ§Ãµes': case 'anotacoes': await comandoAnotacao(message, 'anotaÃ§Ãµes', argumentos); break;
        case 'rmnota': await comandoAnotacao(message, 'rmnota', argumentos); break;
        case 'promover': await comandoPromoverRebaixar(message, 'promover'); break;
        case 'rebaixar': case 'rebaixaradm': await comandoPromoverRebaixar(message, 'rebaixar'); break;
        case 'marcar': case 'marcar2': case 'marcarwa': await comandoMarcar(message, comando, argumentos); break;
        case 'hidetag': await comandoMarcar(message, 'hidetag', argumentos); break;
        case 'opengp': await comandoHorarioGrupo(message, 'abertura', argumentos); break;
        case 'closegp': await comandoHorarioGrupo(message, 'fechamento', argumentos); break;
        case 'rm_opengp': case 'rmopengp': await comandoHorarioGrupo(message, 'remover', argumentos); break;
        case 'time-status': case 'timestatus': await comandoHorarioGrupo(message, 'status', argumentos); break;
        case 'add_palavra': case 'addpalavra': await comandoPalavraAdmin(message, 'adicionar', argumentos); break;
        case 'rm_palavra': case 'rmpalavra': await comandoPalavraAdmin(message, 'remover', argumentos); break;
        case 'lista_palavras': case 'listapalavras': await comandoPalavraAdmin(message, 'listar', argumentos); break;
        case 'prefixos': await comandoPrefixos(message); break;
        case 'listabranca': case 'listabrancaadm': await comandoListaBrancaAdmin(message, 'listar'); break;
        case 'rmlistabranca': case 'rmlistabrancaadm': await comandoListaBrancaAdmin(message, 'remover'); break;
        case 'listanegra': case 'listamute': await comandoListaNegraAdmin(message, 'listar'); break;
        case 'tirardalista': case 'tirarlistanegra': await comandoListaNegraAdmin(message, 'remover'); break;
        case 'msgadm': await comandoMsgAdm(message, argumentos); break;
        case 'addcmdadm': case 'addcmdadmin': await comandoPermissaoComandoAdmin(message, 'adicionar', argumentos); break;
        case 'delcmdadm': case 'delcmdadmin': await comandoPermissaoComandoAdmin(message, 'remover', argumentos); break;
        case 'listcmdadm': case 'listcmdadmin': case 'listacmdadm': await comandoPermissaoComandoAdmin(message, 'listar', argumentos); break;
        case 'add_parceria': case 'addparceria': await comandoParceria(message, 'adicionar', argumentos); break;
        case 'del_parceria': case 'delparceria': await comandoParceria(message, 'remover', argumentos); break;
        case 'parceria': case 'parcerias': await comandoParceria(message, 'listar', argumentos); break;
        case 'modoparceria': await comandoParceria(message, 'modo', argumentos); break;
        case 'sorteio2': await comandoSorteioAvancado(message, 'sorteio2', argumentos); break;
        case 'sorteiogold': await comandoSorteioAvancado(message, 'sorteiogold', argumentos); break;
        case 'anagrama': await comandoAnagramaAdmin(message, argumentos); break;
        case 'autoresposta': case 'auto-resposta': await comandoAutoresposta(message, argumentos); break;
        case 'x9viewonce': case 'revelar': case 'revelarviewonce': await comandoRevelarViewOnce(message); break;
        case 'config':
        case 'conf':
            await comandoConfigAdmin(message, argumentos); break;
        case 'antimencao':
        case 'antipalavra':
        case 'autoban':
        case 'antiimg':
        case 'antivideo':
        case 'antiaudio':
        case 'antidoc':
        case 'antisticker':
        case 'anticatalogo':
        case 'limitexto':
        case 'multiprefix':
            await comandoConfigAdmin(message, `${comando} ${argumentos}`); break;
        case 'antilink':
            await comandoAntiLink(message, argumentos); break;
        case 'antiflood':
            await comandoAntiFlood(message, argumentos); break;
        case 'welcome':
            await comandoWelcomeGoodbye(message, 'welcome', argumentos); break;
        case 'goodbye':
            await comandoWelcomeGoodbye(message, 'goodbye', argumentos); break;
        case 'setwelcome':
            await comandoWelcomeGoodbye(message, 'welcome', argumentos); break;
        case 'setgoodbye':
            await comandoWelcomeGoodbye(message, 'goodbye', argumentos); break;
        case 'economia':
            await comandoToggleGrupo(message, 'economia', argumentos); break;
        case 'xp':
            await comandoToggleGrupo(message, 'xp', argumentos); break;
        case 'cmds':
            await comandoToggleGrupo(message, 'cmds', argumentos); break;
        case 'setregras':
            await comandoRegras(message, argumentos); break;
        case 'regras':
            await comandoRegras(message, argumentos); break;
        case 'setnome':
            await comandoSetNome(message, argumentos); break;
        case 'setfoto':
            await comandoSetFoto(message); break;
        case 'desc':
            await comandoDescricao(message); break;
        case 'setdesc':
            await comandoSetDescricao(message, argumentos); break;
        case 'staff':
            await comandoStaff(message); break;
        case 'darxp':
            await comandoDarXP(message, argumentos); break;
        case 'removerxp':
            await comandoDarXP(message, argumentos, true); break;
        case 'resetxp':
            await comandoResetXP(message, argumentos); break;
        case 'darcoins':
            await comandoDarCoins(message, argumentos); break;
        case 'removercoins':
            await comandoDarCoins(message, argumentos, true); break;
        case 'reseteco':
            await comandoResetEco(message, argumentos); break;
        case 'sorteio':
            await comandoSorteio(message, argumentos); break;
        case 'participar':
            await comandoParticiparSorteio(message); break;
        case 'cancelarsorteio':
            await comandoCancelarSorteio(message); break;
        case 'limpar':
            await comandoLimpar(message, argumentos); break;
        case 'logs':
            await comandoLogs(message); break;
        case 'prefixo':
            if (!(await exigirAdmin(message))) break;
            if (!argumentos.trim()) { await responderCitando(message, `ð£ Prefixo atual: *${obterPrefixoGrupo(message.from)}*\nUse *${obterPrefixoGrupo(message.from)}prefixo !* para alterar.`); break; }
            { const novo=argumentos.trim().split(/\s+/)[0]; if(!/^[!#$%&*+?./:_=-]{1,3}$/.test(novo)){await responderCitando(message,'â Prefixo invÃ¡lido. Escolha 1 a 3 caracteres sem letras/nÃºmeros.');break;} const c=obterConfigAdmin(message.from); c.prefixo=novo; salvarConfigAdmin(); await responderCitando(message,`â Prefixo alterado para *${novo}*.`); }
            break;

        // ============================================================
        // COMANDO DESCONHECIDO
        // ============================================================

        default:

            await reagir(
                message,
                'â'
            );

            await responderCitando(
                message,
                `âââ¢âà¼ºâ¿à¼»ââ¢ââ
ââ¯ *ððððððð ððÌð ðððððððððð*
â
ââ¤ _O comando_
â   *${PREFIXO}${comando}*
â   _nÃ£o existe._
â
ââ¤ *ðððððð:*
â   ð *${PREFIXO}menu*
â
ââ¤ _Ou veja todos os comandos:_
â   ð *${PREFIXO}comandos*
â
âââ¢âà¼ºâ¿à¼»ââ¢ââ`
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

            // Ignorar mensagens do prÃ³prio bot
            if (message.fromMe) {
                return;
            }

// ============================================================
// APAGAR MENSAGENS DE QUEM ESTÃ MUTADO
// ============================================================

const idRemetente =
    obterIdRemetente(message);


// Verificar se o remetente estÃ¡ na blacklist
let naBlacklist = false;

if (idRemetente) {

    // VerificaÃ§Ã£o direta
    if (blacklistMute.has(idRemetente)) {
        naBlacklist = true;
    }

    // VerificaÃ§Ã£o pelo nÃºmero, para funcionar
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
// ð¥ REGISTRAR PARTICIPANTE DO GRUPO
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

    // SÃ³ salva quando uma pessoa nova Ã© adicionada
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
// ð¡ï¸ PROTEÃÃES AUTOMÃTICAS DO GRUPO
// ============================================================

if (message.from.endsWith('@g.us') && idRemetente) {
    const configProtecao = obterConfigAdmin(message.from);
    let autorAdmin = false;
    try { autorAdmin = await usuarioEhAdminDoGrupo(message); } catch {}

    if (!autorAdmin && configProtecao.antilink && /https?:\/\/|www\./i.test(message.body || '')) {
        const links = String(message.body || '').match(/(?:https?:\/\/|www\.)[^\s]+/gi) || [];
        const bloqueado = links.some(link => {
            const dominio = link.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            return !configProtecao.linksPermitidos.some(permitido => dominio === permitido || dominio.endsWith('.' + permitido));
        });
        if (bloqueado) {
            try { await message.delete(true); } catch {}
            await enviarComMencoes(message.from, `âââ¢âà¼ºðà¼»ââ¢ââ\nââ¯ *ðððð ððððððððð*\nâ\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ _Links nÃ£o permitidos sÃ£o bloqueados neste grupo._\nâââ¢âà¼ºðà¼»ââ¢ââ`, { mentions: [idRemetente] });
            return;
        }
    }

    if (!autorAdmin && configProtecao.antiflood) {
        const agora = Date.now();
        const chaveFlood = `${message.from}_${idRemetente}`;
        const lista = historicoFlood.get(chaveFlood) || [];
        lista.push(agora);
        const recentes = lista.filter(t => agora - t <= 10000);
        historicoFlood.set(chaveFlood, recentes);
        if (recentes.length >= configProtecao.floodLimite) {
            historicoFlood.delete(chaveFlood);
            const listaMute = mutados.get(message.from) || new Set();
            listaMute.add(idRemetente); mutados.set(message.from, listaMute); salvarMutados();
            try { await message.delete(true); } catch {}
            await enviarComMencoes(message.from, `âââ¢âà¼ºð¨à¼»ââ¢ââ\nââ¯ *ððððððððð*\nâ\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ ð _VocÃª foi silenciado por flood._\nâââ¢âà¼ºð¨à¼»ââ¢ââ`, { mentions: [idRemetente] });
            return;
        }
    }
    // ð§¹ Filtros configurÃ¡veis adicionais
    if (await aplicarProtecoesAvancadas(message, configProtecao, idRemetente, autorAdmin)) {
        return;
    }
}

// ============================================================
// ð§¹ FILTROS AVANÃADOS DO GRUPO
// ============================================================

function usuarioNaListaBranca(config, id) {
    if (!id || !Array.isArray(config.listaBranca)) return false;
    return config.listaBranca.some(item => idsIguais(item, id));
}

function textoNormalizado(valor) {
    return String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function banirPorIdAutomatico(grupoId, idPessoa) {
    try {
        await client.pupPage.evaluate(async (chatId, participantId) => {
            const chat = await window.WWebJS.getChat(chatId, { getAsModel: false });
            if (!chat || chat.id?.server !== 'g.us') throw new Error('Grupo nÃ£o encontrado.');
            const { lid, phone } = await window.WWebJS.enforceLidAndPnRetrieval(participantId);
            const participante = chat.groupMetadata.participants.get(lid?._serialized) || chat.groupMetadata.participants.get(phone?._serialized);
            if (!participante) throw new Error('Participante nÃ£o encontrado.');
            if (participante.isAdmin || participante.isSuperAdmin) throw new Error('Administrador nÃ£o pode ser removido automaticamente.');
            await window.require('WAWebModifyParticipantsGroupAction').removeParticipants(chat, [participante]);
        }, grupoId, idPessoa);
        return true;
    } catch (erro) {
        console.error('â ï¸ Falha no autoban:', erro.message);
        return false;
    }

}

async function aplicarProtecoesAvancadas(message, config, idRemetente, autorAdmin) {
    if (!message?.from?.endsWith('@g.us') || !idRemetente || autorAdmin) return false;
    if (usuarioNaListaBranca(config, idRemetente)) return false;
    const corpo = String(message.body || '');

    if (config.antiMention && Array.isArray(message.mentionedIds) && message.mentionedIds.length > 0) {
        try { await message.delete(true); } catch {}
        await enviarComMencoes(message.from, `âââ¢âà¼ºð¥à¼»ââ¢ââ\nâ       *ðððð-ððððÌ§ðÌð*\nââ¯\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ _MarcaÃ§Ãµes estÃ£o bloqueadas neste grupo._\nâââ¢âà¼ºð¥à¼»ââ¢ââ`, { mentions: [idRemetente] });
        return true;
    }

    if (config.limitexto && corpo.length > Number(config.limiteTexto || 1000)) {
        try { await message.delete(true); } catch {}
        await enviarComMencoes(message.from, `âââ¢âà¼ºðà¼»ââ¢ââ\nâ       *ððððð ððððð ððððð*\nââ¯\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ ð Limite: *${config.limiteTexto} caracteres*\nâââ¢âà¼ºðà¼»ââ¢ââ`, { mentions: [idRemetente] });
        return true;
    }

    if (config.antiPalavra && Array.isArray(config.palavrasProibidas) && config.palavrasProibidas.length) {
        const texto = textoNormalizado(corpo);
        const palavraBloqueada = config.palavrasProibidas.find(palavra => {
            const alvo = textoNormalizado(palavra).trim();
            return alvo && texto.includes(alvo);
        });
        if (palavraBloqueada) {
            try { await message.delete(true); } catch {}
            await enviarComMencoes(message.from, `âââ¢âà¼ºð¤¬à¼»ââ¢ââ\nâ       *ððððððð ððððððððð*\nââ¯\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ ð« _Esta palavra nÃ£o Ã© permitida neste grupo._\nâââ¢âà¼ºð¤¬à¼»ââ¢ââ`, { mentions: [idRemetente] });
            if (config.autoBan) {
                const removido = await banirPorIdAutomatico(message.from, idRemetente);
                if (removido) await enviarComMencoes(message.from, `âââ¢âà¼ºð¨à¼»ââ¢ââ\nâ          *ððððððð*\nââ¯\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ ð« _UsuÃ¡rio removido por violaÃ§Ã£o do filtro._\nâââ¢âà¼ºð¨à¼»ââ¢ââ`, { mentions: [idRemetente] });
            }
            return true;
        }
    }

    if (message.hasMedia) {
        const tipo = String(message.type || '').toLowerCase();
        const filtros = { image: ['antiImg','ð¼ï¸','ðððððð'], video: ['antiVideo','ð¥','ððÌððð'], audio: ['antiAudio','ðµ','ðÌðððð'], document: ['antiDoc','ð','ððððððððð'], sticker: ['antiSticker','ð§©','ððððððððð'], product: ['antiCatalogo','ðï¸','ððððÌðððð'] };
        const filtro = filtros[tipo];
        if (filtro && config[filtro[0]]) {
            try { await message.delete(true); } catch {}
            await enviarComMencoes(message.from, `âââ¢âà¼º${filtro[1]}à¼»ââ¢ââ\nâ       *${filtro[2]} ððððððððð*\nââ¯\nââ¤ ð¤ @${String(idRemetente).split('@')[0]}\nââ¤ _Este tipo de mÃ­dia estÃ¡ bloqueado neste grupo._\nâââ¢âà¼º${filtro[1]}à¼»ââ¢ââ`, { mentions: [idRemetente] });
            return true;
        }
    }
    return false;
}

// ============================================================
// â¨ XP POR MENSAGEM
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
        // ðï¸ VERIFICAR CONQUISTAS
        // ====================================================

        const novasConquistas =
            verificarConquistas(
                idRemetente,
                resultadoXP
            );

        // ====================================================
        // ðï¸ AVISAR SOBRE NOVAS CONQUISTAS
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

                        `âââ¢âà¼ºðï¸à¼»ââ¢ââ
â
â  *ðððð ððððððððð!*
â
ââ¤ ð¤ ${mencaoUsuario}
â
ââ¤ ${conquista.emoji} *${conquista.nome}*
â
ââ¤ _${conquista.descricao}_
â
âââ¢âà¼ºðï¸à¼»ââ¢ââ
â¨ _Continue participando para desbloquear mais conquistas!_`,

                        {
                            mentions: [
                                idRemetente
                            ]
                        }
                    );

                } catch (erro) {

                    console.error(
                        'â ï¸ Erro ao enviar mensagem de conquista:',
                        erro
                    );

                }
            }
        }

        // ====================================================
        // â­ AVISO DE SUBIDA DE NÃVEL
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
                    `âââ¢âà¼ºâ­à¼»ââ¢ââ
â   *ð ððÌððð ðððððððð!*
ââ¯
ââ¤ ð¤ ${mencaoUsuario}
â   _estÃ¡ ficando cada vez mais forte!_
â
ââ¤ â­ *ðððð ððÌððð*
â   â *NÃ­vel ${resultadoXP.nivel}*
â
ââ¤ â¨ *ðð ððððð*
â   â *${resultadoXP.xp} XP*
â
âââ¢âà¼ºâ­à¼»ââ¢ââ

ð _Continue participando para alcanÃ§ar o prÃ³ximo nÃ­vel!_`,

                    {
                        mentions: [
                            idRemetente
                        ]
                    }
                );

            } catch (erro) {

                console.error(
                    'â ï¸ Erro ao enviar mensagem de nÃ­vel:',
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

                await message.reply(aplicarEstiloMensagem(
                    'Ola Incrivel Bea!'
                ));

                // Para aqui somente porque
                // o OI AUTO jÃ¡ respondeu
                return;
            }
        }

    } catch (erro) {

        console.error(
            'â Erro no OI AUTO:',
            erro
        );
    }
}


// MODERAÃÃO
if (
    mutadoNoGrupo ||
    naBlacklist
) {

    console.log(
        'ð USUÃRIO MUTADO! APAGANDO MENSAGEM...'
    );

    try {

        await message.delete(true);

        console.log(
            'ðï¸ MENSAGEM APAGADA!'
        );

    } catch (erro) {

        console.log(
            'â ERRO AO APAGAR:',
            erro.message
        );
    }

    return;
}
            
// ============================================================
// ð CONFIRMAÃÃO PARA LIMPAR PIADAS
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
            'ðï¸'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ðððððð ðððððððð!*
â
ââ¤ Todas as piadas foram
â   removidas com sucesso.
â
â  ð Total atual:
â   *0 piadas*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
        );

        return;
    }

    if (
        respostaLimpar === 'nao' ||
        respostaLimpar === 'nÃ£o'
    ) {

        confirmacoesLimparPiadas.delete(
            chave
        );

        await reagir(
            message,
            'â'
        );

        await responderCitando(
            message,
            `âââ¢âà¼ºðà¼»ââ¢ââ
â
â  *ððÌ§ðÌð ððððððððð*
â
â  As piadas continuam
â  intactas. ð
â
â  ð Total:
â   *${piadas.length} piada${piadas.length === 1 ? '' : 's'}*
â
âââ¢âà¼ºðà¼»ââ¢ââ`
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
// ð¶ RESPOSTA DE PROPOSTA DE ADOÃÃO
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
// ð¤ SISTEMA AFK
// ============================================================

if (
    message.from.endsWith('@g.us')
) {

    const idRemetenteAFK =
        obterIdAFK(message);


    // ========================================================
    // ð VERIFICAR SE O REMETENTE ESTAVA AFK
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
    // ð VERIFICAR MENÃÃES
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
                `â­âââã ð¤ ððððÌððð ððð ãââââ®
â
â ð¤ @${String(idMencionado).split('@')[0]}
â
â ð *Motivo:* _${dadosAFK.motivo}_
â â±ï¸ *Ausente hÃ¡:* ${formatarTempoAFKCurto(dadosAFK.inicio)}
â
â°âââââââââââââââââââââ¯
ð¤ _Este usuÃ¡rio estÃ¡ temporariamente ausente._`
            , { mentions: [idMencionado] }
            );

        }

    }


    // ========================================================
    // â©ï¸ VERIFICAR RESPOSTA
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
                        `â­âââã ð¤ ððððÌððð ððð ãââââ®
â
â ð¤ @${String(idAutorResposta).split('@')[0]}
â
â ð *Motivo:* _${dadosAFK.motivo}_
â â±ï¸ *Ausente hÃ¡:* ${formatarTempoAFKCurto(dadosAFK.inicio)}
â
â°âââââââââââââââââââââ¯
ð¤ _Este usuÃ¡rio estÃ¡ temporariamente ausente._`
                    , { mentions: [idAutorResposta] }
                    );

                }

            }

        } catch (erro) {

            console.log(
                'â ï¸ Erro ao verificar resposta AFK:',
                erro.message
            );

        }

    }

}

// 🤖 AUTORESPONDER
            try { await processarAutoresposta(message); } catch (erroAuto) { console.error('⚠️ Erro na autoresposta:', erroAuto.message); }

            // Ignorar mensagens normais
            const prefixoMensagem = obterPrefixoGrupo(message.from);
            const configPrefixo = obterConfigAdmin(message.from);
            const corpoMensagem = message.body.trim();
            const usaPrefixo =
                corpoMensagem.startsWith(prefixoMensagem) ||
                (configPrefixo.multiprefix && corpoMensagem.startsWith(PREFIXO));

            if (!usaPrefixo) {
                return;
            }

            const texto =
                corpoMensagem
                    .slice(
                        corpoMensagem.startsWith(prefixoMensagem)
                            ? prefixoMensagem.length
                            : PREFIXO.length
                    )
                    .trim();

            if (!texto) {
                await reagir(
                    message,
                    'â'
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
                'â ERRO NO PROCESSAMENTO:',
                erro
            );

            try {

                await reagir(
                    message,
                    'â'
                );

                await responderCitando(
                    message,
                    'â _Ocorreu um erro ao executar esse comando._'
                );

            } catch (erroResposta) {

                console.error(
                    'â NÃ£o foi possÃ­vel enviar a mensagem de erro:',
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

    // Evita verificar a mesma hora vÃ¡rias vezes
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
    `â­âã ð *ððððð* ã
â
â â *${aviso.mensagem}*
â
â°ââââââââââââââââ`
);;

                    aviso.ultimoEnvio = data;

                    salvarAvisos();

                    console.log(
                        `ð Aviso enviado para ${grupoId}: ${aviso.mensagem}`
                    );

                } catch (erro) {
                    console.error(
                        `â Erro ao enviar aviso para ${grupoId}:`,
                        erro
                    );
                }
            }
        }
    }
}

client.on('group_join', async notification => {
    try {
        const config = obterConfigAdmin(notification.chatId);
        if (!config?.welcome) return;
        const chat = await client.getChatById(notification.chatId);
        const ids = notification.recipientIds || [];
        const nomeGrupo = chat?.name || 'este grupo';
        const membros = chat?.participants?.length || 0;
        for (const id of ids) {
            const textoBase = String(config.welcomeTexto || '')
                .replace(/@pessoa/gi, `@${String(id).split('@')[0]}`)
                .replace(/@grupo/gi, nomeGrupo)
                .replace(/@membros/gi, String(membros));
            await enviarComMencoes(notification.chatId, aplicarEstiloMensagem(textoBase), { mentions: [id] });
        }
    } catch (erro) { console.error('â ï¸ Erro no welcome:', erro); }
});

client.on('group_leave', async notification => {
    try {
        const config = obterConfigAdmin(notification.chatId);
        if (!config?.goodbye) return;
        const chat = await client.getChatById(notification.chatId);
        const id = notification.recipientId || notification.author;
        if (!id) return;
        const textoBase = String(config.goodbyeTexto || '')
            .replace(/@pessoa/gi, `@${String(id).split('@')[0]}`)
            .replace(/@grupo/gi, chat?.name || 'este grupo')
            .replace(/@membros/gi, String(chat?.participants?.length || 0));
        await enviarComMencoes(notification.chatId, aplicarEstiloMensagem(textoBase), { mentions: [id] });
    } catch (erro) { console.error('â ï¸ Erro no goodbye:', erro); }
});

client.on('ready', () => {
    console.log('ð Sistema de avisos iniciado!');

    verificarAvisos().catch(erro => {
        console.error('â Erro na verificaÃ§Ã£o inicial dos avisos:', erro);
    });

    setInterval(() => {
        verificarAvisos().catch(erro => {
            console.error('â Erro na verificaÃ§Ã£o dos avisos:', erro);
        });
    }, 15000);
});

let ultimoTickHorario = null;
setInterval(() => {
    const agora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Sao_Paulo'});
    if (agora === ultimoTickHorario) return;
    ultimoTickHorario = agora;
    verificarHorariosGrupos().catch(erro => console.error('â ï¸ Erro no agendamento de grupos:', erro.message));
}, 30000);

// ============================================================
// INICIALIZAÃÃO
// ============================================================

console.log(
    '\nIniciando WhatsApp...\n'
);

client.initialize();