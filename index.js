const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const GIFEncoder = require('gif-encoder-2');
const ytSearch = require('yt-search');

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
const VERSAO = '3.7';

const jogosAdivinhacao = new Map();
const quizzes = new Map();
const mutados = new Map();
const blacklistMute = new Set();


// ============================================================
// CONEXÃO
// ============================================================

client.on('qr', qr => {
    console.log('\nEscaneie o QR Code abaixo:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n====================================');
    console.log('BOT CONECTADO E PRONTO!');
    console.log('====================================\n');
});

client.on('auth_failure', mensagem => {
    console.error('❌ Falha na autenticação:', mensagem);
});

client.on('disconnected', motivo => {
    console.log('⚠️ Bot desconectado:', motivo);
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

        return await client.sendMessage(
            message.from,
            conteudo,
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

        if (mencoes && mencoes.length > 0) {
            return mencoes[0];
        }

        return null;

    } catch (erro) {
        console.log(
            '⚠️ Erro ao obter menção:',
            erro.message
        );

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

function mencaoDaPessoa(contato) {
    if (!contato) {
        return '@alguém';
    }

    const nome =
        contato.pushname ||
        contato.name ||
        contato.shortName ||
        contato.number ||
        'alguém';

    return `@${nome}`;
}

// NOVO SISTEMA DE MENÇÃO
// O whatsapp-web.js não recomenda mais enviar Contact[]
// diretamente em "mentions". Agora usamos os IDs serializados.

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
├➤ _Mencione alguém do grupo._
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
    return (
        message.author ||
        message.from
    );
}

async function ehAdminDoGrupo(message) {
    try {
        const chat =
            await message.getChat();

        if (!chat.isGroup) {
            return false;
        }

        const idRemetente =
            obterIdRemetente(message);

        const participante =
            chat.participants.find(
                p =>
                    p.id._serialized ===
                    idRemetente
            );

        return !!(
            participante &&
            participante.isAdmin
        );

    } catch (erro) {
        console.log(
            '⚠️ Erro ao verificar admin:',
            erro.message
        );

        return false;
    }
}

async function exigirAdmin(message) {
    const chat =
        await message.getChat();

    if (!chat.isGroup) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐄𝐗𝐂𝐋𝐔𝐒𝐈𝐕𝐎 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎*
│
├➤ _Esse comando só funciona em grupos._
│
┗═•❃༺✿༻❃•═┛`
        );

        return false;
    }

    const admin =
        await ehAdminDoGrupo(message);

    if (!admin) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
├✯ *𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎*
│
├➤ _Esse comando é exclusivo para_
│   _admins do grupo._
│
┗═•❃༺✿༻❃•═┛`
        );

        return false;
    }

    return true;
}


// ============================================================
// MENU PRINCIPAL
// ============================================================

async function menuPrincipal(message) {
    await reagir(message, '📋');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
├✯ *𝐌𝐄𝐍𝐔 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋*
│
├➤ 📋 *${PREFIXO}menuJogos*
│   _Jogos e desafios_
│
├➤ ⚔️ *${PREFIXO}menuRPG*
│   _Ações e aventuras_
│
├➤ 🖼️ *${PREFIXO}menuMidia*
│   _Ferramentas para mídia_
│
├➤ 🛠️ *${PREFIXO}menuUtil*
│   _Utilidades do bot_
│
├➤ 🛡️ *${PREFIXO}menuAdmin*
│   _Comandos de administração_
│
├➤ 🤖 *${PREFIXO}menuBot*
│   _Informações e configurações_
│
├➤ 📜 *${PREFIXO}comandos*
│   _Lista completa de comandos_
│
├➤ 📝 *${PREFIXO}changelog*
│   _Veja o que mudou_
│
├➤ ℹ️ *${PREFIXO}sobre*
│   _Informações sobre o bot_
│
├✯ *𝐕𝐄𝐑𝐒𝐀̃𝐎: ${VERSAO}*
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU JOGOS
// ============================================================

async function menuJogos(message) {
    await reagir(message, '🎮');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🎮 𝐉𝐎𝐆𝐎𝐒*
├✯
├➤ 🎲 *${PREFIXO}dado*
│   _Jogue um dado de 1 a 6_
│
├➤ 🪙 *${PREFIXO}moeda*
│   _Cara ou coroa_
│
├➤ 🔮 *${PREFIXO}sn pergunta*
│   _Faça uma pergunta de sim ou não_
│
├➤ ✂️ *${PREFIXO}ppt pedra*
│   _Pedra, papel ou tesoura_
│
├➤ 🔢 *${PREFIXO}adivinha*
│   _Adivinhe um número de 1 a 10_
│
├➤ 🎯 *${PREFIXO}chute número*
│   _Tente acertar o número_
│
├➤ 🧠 *${PREFIXO}quiz*
│   _Teste seus conhecimentos_
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU RPG
// ============================================================

async function menuRPG(message) {
    await reagir(message, '⚔️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *⚔️ 𝐑𝐏𝐆*
├✯ *𝐀𝐂̧𝐎̃𝐄𝐒*
│
├➤ 🖐️ *${PREFIXO}tapa @pessoa*
│   _Dê um tapa fictício_
│
├➤ 👊 *${PREFIXO}soco @pessoa*
│   _Ataque fictício_
│
├➤ 🦵 *${PREFIXO}chute @pessoa*
│   _Chute cinematográfico_
│
├➤ 💨 *${PREFIXO}empurrar @pessoa*
│   _Empurrão fictício_
│
├✯ *𝐒𝐎𝐂𝐈𝐀𝐋*
│
├➤ 🫂 *${PREFIXO}abracar @pessoa*
│   _Dê um abraço_
│
├➤ 🛡️ *${PREFIXO}proteger @pessoa*
│   _Proteja alguém_
│
├➤ 💚 *${PREFIXO}curar @pessoa*
│   _Recupere HP fictício_
│
├➤ ⭐ *${PREFIXO}elogiar @pessoa*
│   _Faça um elogio_
│
├➤ 😂 *${PREFIXO}zoar @pessoa*
│   _Uma zoeira fictícia_
│
├✯ *𝐎𝐔𝐓𝐑𝐎𝐒*
│
├➤ ⚔️ *${PREFIXO}duelo @pessoa*
│   _Desafie alguém_
│
├➤ 💰 *${PREFIXO}roubar @pessoa*
│   _Tente roubar moedas fictícias_
│
├➤ 🗺️ *${PREFIXO}aventura*
│   _Parta para uma aventura_
│
├✯ _Todas as ações são 100% fictícias._
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU MÍDIA
// ============================================================

async function menuMidia(message) {
    await reagir(message, '🖼️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🖼️ 𝐌𝐈́𝐃𝐈𝐀*
├✯
├➤ 🖼️ *${PREFIXO}fig*
│   _Transforme uma imagem em figurinha_
│
├➤ 🎨 *${PREFIXO}figurinha*
│   _Mesmo comando que ${PREFIXO}fig_
│
├➤ 🌀 *${PREFIXO}emojimix emoji1 emoji2*
│   _Funde dois emojis em uma figurinha_
│
├➤ 🍏 *${PREFIXO}brat1 texto*
│   _Figurinha estilo brat_
│
├➤ 🎞️ *${PREFIXO}brat2 texto*
│   _Mesma coisa, só que animada_
│
├➤ 🎵 *${PREFIXO}playm nome da música*
│   _Ficha da música + prévia em áudio_
│
├✯ *𝐎𝐁𝐒𝐄𝐑𝐕𝐀𝐂̧𝐀̃𝐎*
│
├➤ _Imagens de visualização única não podem_
│   _ser convertidas porque o WhatsApp não_
│   _fornece a mídia ao bot._
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU UTILIDADES
// ============================================================

async function menuUtil(message) {
    await reagir(message, '🛠️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🛠️ 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒*
├✯
├➤ 🏓 *${PREFIXO}ping*
│   _Verifica se o bot está online_
│
├➤ 🕐 *${PREFIXO}hora*
│   _Mostra a hora atual_
│
├➤ ℹ️ *${PREFIXO}info*
│   _Informações do bot_
│
├➤ 🤖 *${PREFIXO}sobre*
│   _Sobre o JUST BOT_
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU BOT
// ============================================================

async function menuBot(message) {
    await reagir(message, '🤖');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🤖 𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
├✯
├➤ 📋 *${PREFIXO}menu*
│   _Menu principal_
│
├➤ 📜 *${PREFIXO}comandos*
│   _Lista de comandos_
│
├➤ 📝 *${PREFIXO}changelog*
│   _Histórico de atualizações_
│
├➤ ℹ️ *${PREFIXO}sobre*
│   _Sobre o bot_
│
├➤ ⚙️ *${PREFIXO}info*
│   _Informações técnicas_
│
├➤ 🏓 *${PREFIXO}ping*
│   _Verificar status_
│
├✯ *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝐀𝐓𝐔𝐀𝐋: ${VERSAO}*
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// MENU ADMIN
// ============================================================

async function menuAdmin(message) {
    const admin =
        await exigirAdmin(message);

    if (!admin) return;

    await reagir(message, '🛡️');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🛡️ 𝐀𝐃𝐌𝐈𝐍*
├✯ *𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐃𝐄 𝐀𝐃𝐌𝐈𝐍*
│
├➤ *${PREFIXO}mute @pessoa*
│   _Apaga as mensagens dessa pessoa_
│
├➤ *${PREFIXO}muteblacklist número*
│   _Silencia um número para sempre_
│
├✯ _O bot precisa ser admin do grupo_
│   _para conseguir apagar mensagens._
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// COMANDOS
// ============================================================

async function listarComandos(message) {
    await reagir(message, '📜');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *📜 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒*
├✯ *𝐌𝐄𝐍𝐔𝐒*
│
├➤ 📋 *${PREFIXO}menu*
├➤ 🎮 *${PREFIXO}menuJogos*
├➤ ⚔️ *${PREFIXO}menuRPG*
├➤ 🖼️ *${PREFIXO}menuMidia*
├➤ 🛠️ *${PREFIXO}menuUtil*
├➤ 🤖 *${PREFIXO}menuBot*
│
├✯ *𝐉𝐎𝐆𝐎𝐒*
│
├➤ 🎲 *${PREFIXO}dado*
├➤ 🪙 *${PREFIXO}moeda*
├➤ 🔮 *${PREFIXO}sn*
├➤ ✂️ *${PREFIXO}ppt*
├➤ 🔢 *${PREFIXO}adivinha*
├➤ 🎯 *${PREFIXO}chute*
├➤ 🧠 *${PREFIXO}quiz*
│
├✯ *𝐑𝐏𝐆*
│
├➤ 🖐️ *${PREFIXO}tapa*
├➤ 👊 *${PREFIXO}soco*
├➤ 🦵 *${PREFIXO}chute @pessoa*
├➤ 💨 *${PREFIXO}empurrar*
├➤ 🫂 *${PREFIXO}abracar*
├➤ 🛡️ *${PREFIXO}proteger*
├➤ 💚 *${PREFIXO}curar*
├➤ ⭐ *${PREFIXO}elogiar*
├➤ 😂 *${PREFIXO}zoar*
├➤ ⚔️ *${PREFIXO}duelo*
├➤ 💰 *${PREFIXO}roubar*
├➤ 🗺️ *${PREFIXO}aventura*
│
├✯ *𝐌𝐈́𝐃𝐈𝐀*
│
├➤ 🖼️ *${PREFIXO}fig*
├➤ 🎨 *${PREFIXO}figurinha*
├➤ 🌀 *${PREFIXO}emojimix*
├➤ 🍏 *${PREFIXO}brat1*
├➤ 🎞️ *${PREFIXO}brat2*
├➤ 🎵 *${PREFIXO}playm*
│
├✯ *𝐀𝐃𝐌𝐈𝐍*
│
├➤ 🛡️ *${PREFIXO}menuAdmin*
├➤ 🔇 *${PREFIXO}mute @pessoa*
├➤ 🚫 *${PREFIXO}muteblacklist número*
│
├✯ *𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒*
│
├➤ 🏓 *${PREFIXO}ping*
├➤ 🕐 *${PREFIXO}hora*
├➤ ℹ️ *${PREFIXO}info*
├➤ 🤖 *${PREFIXO}sobre*
├➤ 📝 *${PREFIXO}changelog*
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// CHANGELOG
// ============================================================

async function changelog(message) {
    await reagir(message, '📝');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *📝 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆*
├✯ *𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
│
├✯ *𝐕𝐄𝐑𝐒𝐀̃𝐎 ${VERSAO}*
│   _02/09/2026_
│
├➤ 🍏 *𝐁𝐑𝐀𝐓*
│   _Fundo da figurinha brat trocado_
│   _de verde para branco._
│
├✯ *𝐕𝐄𝐑𝐒𝐀̃𝐎 𝐀𝐍𝐓𝐄𝐑𝐈𝐎𝐑*
│   _3.5_
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// SOBRE
// ============================================================

async function sobre(message) {
    await reagir(message, '🤖');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🤖 𝐉𝐔𝐒𝐓 𝐁𝐎𝐓*
├✯
├➤ _Um bot de WhatsApp feito em Node.js._
│
├➤ ⚙️ *whatsapp-web.js*
├➤ 🟢 *Node.js*
├➤ 🌐 *WhatsApp Web*
│
├➤ *𝐕𝐄𝐑𝐒𝐀̃𝐎: ${VERSAO}*
│
├✯ _Digite ${PREFIXO}menu para começar!_
┗═•❃༺✿༻❃•═┛`
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

    await client.sendMessage(
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

    await client.sendMessage(
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

    await client.sendMessage(
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

    await client.sendMessage(
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

    await client.sendMessage(
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

    await client.sendMessage(
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

    await client.sendMessage(
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
    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const mencao =
        mencaoDaPessoa(pessoa);

    const idPessoa =
        idDaPessoa(pessoa);

    const moedas =
        Math.floor(
            Math.random() * 91
        ) + 10;

    const sucesso =
        Math.random() < 0.6;

    await reagir(message, '💰');

    const opcoesEnvio = {};

    if (idPessoa) {
        opcoesEnvio.mentions = [idPessoa];
    }

    await client.sendMessage(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *💰 𝐑𝐎𝐔𝐁𝐀𝐑*
├✯
├➤ _Você tentou roubar ${mencao}!_
│
├➤ *💰 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀:* ${moedas}
│   _moedas fictícias_
│
├➤ *🎲 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎:*
│   ${sucesso
            ? '✅ *𝐑𝐎𝐔𝐁𝐎 𝐁𝐄𝐌-𝐒𝐔𝐂𝐄𝐃𝐈𝐃𝐎!*'
            : '❌ *𝐕𝐎𝐂𝐄̂ 𝐅𝐎𝐈 𝐏𝐄𝐆𝐎!*'}
│
┗═•❃༺✿༻❃•═┛`,
        opcoesEnvio
    );
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
    argumento
) {
    const escolha =
        argumento
            .toLowerCase()
            .trim();

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
// QUIZ
// ============================================================

const perguntasQuiz = [
    {
        pergunta:
            'Qual é o maior planeta do Sistema Solar?',
        opcoes:
            'A) Terra\nB) Marte\nC) Júpiter\nD) Saturno',
        resposta: 'c'
    },
    {
        pergunta:
            'Quantos lados tem um hexágono?',
        opcoes:
            'A) 5\nB) 6\nC) 7\nD) 8',
        resposta: 'b'
    },
    {
        pergunta:
            'Qual é o resultado de 7 × 8?',
        opcoes:
            'A) 54\nB) 56\nC) 64\nD) 48',
        resposta: 'b'
    },
    {
        pergunta:
            'Qual é a capital do Brasil?',
        opcoes:
            'A) São Paulo\nB) Rio de Janeiro\nC) Brasília\nD) Salvador',
        resposta: 'c'
    },
    {
        pergunta:
            'Qual destes é um mamífero?',
        opcoes:
            'A) Tubarão\nB) Golfinho\nC) Jacaré\nD) Pinguim',
        resposta: 'b'
    }
];

async function iniciarQuiz(message) {
    const pergunta =
        perguntasQuiz[
            Math.floor(
                Math.random() *
                perguntasQuiz.length
            )
        ];

    quizzes.set(
        message.from,
        pergunta
    );

    await reagir(message, '🧠');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🧠 𝐐𝐔𝐈𝐙*
├✯
├➤ _${pergunta.pergunta}_
│
${pergunta.opcoes}
│
├➤ *📝 ${PREFIXO}quiz a/b/c/d*
│   _Escolha uma alternativa._
┗═•❃༺✿༻❃•═┛`
    );
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
            `https://emojik.vercel.app/s/${encodeURIComponent(emojiUm)}_${encodeURIComponent(emojiDois)}?size=512`;

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
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function quebrarTextoBrat(texto, tamanhoLinha) {
    const palavras =
        texto.trim().split(/\s+/);

    const linhas = [];
    let linhaAtual = '';

    for (const palavra of palavras) {
        const tentativa =
            linhaAtual
                ? `${linhaAtual} ${palavra}`
                : palavra;

        if (tentativa.length > tamanhoLinha) {
            if (linhaAtual) linhas.push(linhaAtual);
            linhaAtual = palavra;
        } else {
            linhaAtual = tentativa;
        }
    }

    if (linhaAtual) linhas.push(linhaAtual);

    return linhas;
}

function calcularLayoutBrat(texto) {
    const larguraUtil = 440;
    const alturaUtil = 440;
    const fatorLargura = 0.58;

    let fonte = 150;

    while (fonte > 30) {
        const caracteresPorLinha =
            Math.max(
                3,
                Math.floor(
                    larguraUtil / (fonte * fatorLargura)
                )
            );

        const linhas =
            quebrarTextoBrat(
                texto,
                caracteresPorLinha
            );

        const alturaLinha = fonte * 1.05;
        const alturaTotal = linhas.length * alturaLinha;

        if (alturaTotal <= alturaUtil) {
            return { fonte, linhas, alturaLinha };
        }

        fonte -= 4;
    }

    const caracteresPorLinha =
        Math.max(
            3,
            Math.floor(larguraUtil / (30 * fatorLargura))
        );

    return {
        fonte: 30,
        linhas: quebrarTextoBrat(texto, caracteresPorLinha),
        alturaLinha: 30 * 1.05
    };
}

function construirSvgBrat(
    layout,
    opcoes = {}
) {
    const tamanho = 512;

    const desfoque = opcoes.desfoque || 0;
    const escala = opcoes.escala || 1;
    const deslocamentoX = opcoes.deslocamentoX || 0;

    const { fonte, linhas, alturaLinha } = layout;

    const alturaTotal = linhas.length * alturaLinha;

    const yInicial =
        (tamanho / 2) -
        (alturaTotal / 2) +
        (alturaLinha * 0.8);

    const linhasSvg = linhas
        .map(
            (linha, indice) =>
                `<tspan x="30" y="${yInicial + indice * alturaLinha}">${escaparXmlBrat(linha)}</tspan>`
        )
        .join('');

    const centro = tamanho / 2;

    const deslocX =
        centro - centro * escala + deslocamentoX;

    const deslocY =
        centro - centro * escala;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}">
    <rect width="100%" height="100%" fill="#ffffff" />
    <filter id="desfoqueBrat">
        <feGaussianBlur stdDeviation="${desfoque}" />
    </filter>
    <g transform="translate(${deslocX}, ${deslocY}) scale(${escala})">
        <text font-family="Helvetica, Arial, sans-serif" font-size="${fonte}" fill="#101010" filter="url(#desfoqueBrat)">
            ${linhasSvg}
        </text>
    </g>
</svg>`;
}

async function gerarBrat1(
    message,
    argumento
) {
    const texto =
        argumento.trim();

    if (!texto) {
        await reagir(message, '❌');

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
                texto.toLowerCase()
            );

        const svg =
            construirSvgBrat(
                layout,
                {
                    desfoque: 1.1
                }
            );

        const buffer =
            await sharp(Buffer.from(svg))
                .png()
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

        await reagir(message, '✅');

    } catch (erro) {
        console.error(
            '❌ Erro ao gerar brat1:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            '❌ _Não foi possível gerar a figurinha._'
        );
    }
}

async function gerarBrat2(
    message,
    argumento
) {
    const texto =
        argumento.trim();

    if (!texto) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐓𝐄𝐗𝐓𝐎 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_
*${PREFIXO}brat2 ola a todos*`
        );

        return;
    }

    try {
        const layout =
            calcularLayoutBrat(
                texto.toLowerCase()
            );

        const encoder =
            new GIFEncoder(512, 512);

        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(90);
        encoder.setQuality(10);

        const totalQuadros = 12;

        for (
            let quadro = 0;
            quadro < totalQuadros;
            quadro++
        ) {
            const proporcao =
                quadro / totalQuadros;

            const onda =
                Math.sin(
                    proporcao * Math.PI * 2
                );

            const desfoque =
                1 + Math.abs(onda) * 1.5;

            const escala =
                1 + onda * 0.07;

            const deslocamentoX =
                onda * 8;

            const svg =
                construirSvgBrat(
                    layout,
                    {
                        desfoque,
                        escala,
                        deslocamentoX
                    }
                );

            const bufferRgba =
                await sharp(Buffer.from(svg))
                    .resize(512, 512)
                    .ensureAlpha()
                    .raw()
                    .toBuffer();

            encoder.addFrame(bufferRgba);
        }

        encoder.finish();

        const bufferGif =
            encoder.out.getData();

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

        await reagir(message, '✅');

    } catch (erro) {
        console.error(
            '❌ Erro ao gerar brat2:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ _Não foi possível gerar a figurinha animada._
_Verifique se o ffmpeg está instalado no sistema._`
        );
    }
}


// ============================================================
// MUSIC PLAYER
// ============================================================

async function tocarMusica(
    message,
    argumento
) {
    const termoBusca =
        argumento.trim();

    if (!termoBusca) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐍𝐎𝐌𝐄 𝐃𝐀 𝐌𝐔́𝐒𝐈𝐂𝐀 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_
*${PREFIXO}playm nome da música*`
        );

        return;
    }

    try {
        const resultadoBusca =
            await ytSearch(termoBusca);

        const video =
            resultadoBusca.videos &&
            resultadoBusca.videos[0];

        if (!video) {
            throw new Error(
                'Música não encontrada.'
            );
        }

        await reagir(message, '🎵');

        await responderCitando(
            message,
            `┏═•❃༺✿༻❃•═┓
│   *🎵 𝐓𝐎𝐂𝐀𝐍𝐃𝐎*
├✯
├➤ *𝐓𝐈́𝐓𝐔𝐋𝐎:*
│   _${video.title}_
│
├➤ *𝐀𝐔𝐓𝐎𝐑:* ${video.author.name}
├➤ *𝐃𝐔𝐑𝐀𝐂̧𝐀̃𝐎:* ${video.timestamp}
├➤ *𝐕𝐈𝐄𝐖𝐒:* ${Number(video.views).toLocaleString('pt-BR')}
│
├➤ 🔗 ${video.url}
│
┗═•❃༺✿༻❃•═┛`
        );

        const urlCapa =
            video.thumbnail ||
            `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

        try {
            const respostaCapa =
                await fetch(urlCapa);

            if (!respostaCapa.ok) {
                throw new Error(
                    `Capa retornou status ${respostaCapa.status}.`
                );
            }

            const bytesCapa =
                await respostaCapa.arrayBuffer();

            const capa =
                new MessageMedia(
                    'image/jpeg',
                    Buffer
                        .from(bytesCapa)
                        .toString('base64'),
                    'capa.jpg'
                );

            await client.sendMessage(
                message.from,
                capa,
                {
                    sendMediaAsDocument: true,
                    caption: `🖼️ ${video.title}`
                }
            );

        } catch (erroCapa) {
            console.log(
                '⚠️ Não foi possível enviar a capa:',
                erroCapa.message
            );
        }

        const respostaItunes =
            await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(termoBusca)}&media=music&limit=1`
            );

        const dadosItunes =
            await respostaItunes.json();

        const faixa =
            dadosItunes.results &&
            dadosItunes.results[0];

        if (faixa && faixa.previewUrl) {
            const respostaAudio =
                await fetch(faixa.previewUrl);

            const bytesAudio =
                await respostaAudio.arrayBuffer();

            const audio =
                new MessageMedia(
                    'audio/mpeg',
                    Buffer
                        .from(bytesAudio)
                        .toString('base64'),
                    'previa.mp3'
                );

            await client.sendMessage(
                message.from,
                audio
            );

        } else {
            await responderCitando(
                message,
                `⚠️ _Prévia oficial de áudio não encontrada_
_para essa música._`
            );
        }

    } catch (erro) {
        console.error(
            '❌ Erro ao buscar música:',
            erro
        );

        await reagir(message, '❌');

        await responderCitando(
            message,
            '❌ _Não foi possível encontrar essa música._'
        );
    }
}


// ============================================================
// MODERAÇÃO
// ============================================================

async function mutarPessoa(message) {
    const admin =
        await exigirAdmin(message);

    if (!admin) return;

    const pessoa =
        await exigirPessoa(message);

    if (!pessoa) return;

    const idPessoa =
        idDaPessoa(pessoa);

    if (!idPessoa) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            '❌ _Não foi possível identificar essa pessoa._'
        );

        return;
    }

    if (!mutados.has(message.from)) {
        mutados.set(
            message.from,
            new Set()
        );
    }

    mutados
        .get(message.from)
        .add(idPessoa);

    const mencao =
        mencaoDaPessoa(pessoa);

    await reagir(message, '🔇');

    await client.sendMessage(
        message.from,
        `┏═•❃༺✿༻❃•═┓
│   *🔇 𝐌𝐔𝐓𝐄*
├✯
├➤ _${mencao} foi silenciado neste grupo._
│
├➤ _As mensagens dessa pessoa serão_
│   _apagadas automaticamente._
│
┗═•❃༺✿༻❃•═┛`,
        {
            mentions: [idPessoa]
        }
    );
}

async function adicionarBlacklist(
    message,
    argumento
) {
    const admin =
        await exigirAdmin(message);

    if (!admin) return;

    const numero =
        argumento.replace(/\D/g, '');

    if (!numero) {
        await reagir(message, '❌');

        await responderCitando(
            message,
            `❌ *𝐍𝐔́𝐌𝐄𝐑𝐎 𝐍𝐀̃𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎.*

_Exemplo:_
*${PREFIXO}muteblacklist 5583900000000*`
        );

        return;
    }

    const idNumero =
        `${numero}@c.us`;

    blacklistMute.add(idNumero);

    await reagir(message, '🚫');

    await responderCitando(
        message,
        `┏═•❃༺✿༻❃•═┓
│   *🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓*
├✯
├➤ _O número ${numero} entrou na_
│   _lista negra de mute._
│
├➤ _Ele será silenciado em todos os_
│   _grupos onde o bot estiver._
│
┗═•❃༺✿༻❃•═┛`
    );
}


// ============================================================
// PROCESSADOR DE COMANDOS
// ============================================================

async function processarComando(
    message,
    comando,
    argumentos
) {
    switch (comando) {

        // MENUS

        case 'menu':
            await menuPrincipal(message);
            break;

        case 'menujogos':
            await menuJogos(message);
            break;

        case 'menurpg':
            await menuRPG(message);
            break;

        case 'menumidia':
            await menuMidia(message);
            break;

        case 'menuutil':
            await menuUtil(message);
            break;

        case 'menubot':
            await menuBot(message);
            break;

        case 'menuadmin':
            await menuAdmin(message);
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


        // JOGOS

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
                message.mentionedIds &&
                message.mentionedIds.length > 0
            ) {
                await chuteRPG(message);
            } else {
                await fazerChute(
                    message,
                    argumentos
                );
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


        // RPG

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


        // ADMIN

        case 'mute':
            await mutarPessoa(message);
            break;

        case 'muteblacklist':
            await adicionarBlacklist(
                message,
                argumentos
            );
            break;


        // UTILIDADES

        case 'ping':
            await ping(message);
            break;

        case 'hora':
            await mostrarHora(message);
            break;

        case 'info':
            await mostrarInfo(message);
            break;


        // MÍDIA

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

        case 'playm':
            await tocarMusica(
                message,
                argumentos
            );
            break;


        // COMANDO DESCONHECIDO

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

            // Apagar mensagens de quem está mutado
            const idRemetente =
                obterIdRemetente(message);

            const mutadoNoGrupo =
                mutados.get(message.from) &&
                mutados
                    .get(message.from)
                    .has(idRemetente);

            const naBlacklist =
                blacklistMute.has(idRemetente);

            if (mutadoNoGrupo || naBlacklist) {
                try {
                    await message.delete(true);
                } catch (erro) {
                    console.log(
                        '⚠️ Não foi possível apagar mensagem de mutado:',
                        erro.message
                    );
                }

                return;
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


// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(
    '\nIniciando WhatsApp...\n'
);

client.initialize();
