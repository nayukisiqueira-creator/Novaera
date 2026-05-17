// ==========================================
// 🛠️ DEPENDÊNCIAS E CONFIGURAÇÕES INICIAIS
// ==========================================
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

const prefix = 'c!';

let filaSelecao = []; 
let aprendizesLista = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ==========================================
// 📡 MONITOR DE ERROS EM TEMPO REAL
// ==========================================
process.on('unhandledRejection', (reason, p) => {
    console.log(' [🚨 ERRO GRAVE] Rejeição não tratada:');
    console.log(reason, p);
});

process.on('uncaughtException', (err, origin) => {
    console.log(' [🚨 ERRO CRÍTICO] Exceção não capturada:');
    console.log(err, origin);
});

client.on('error', (err) => {
    console.log(' [⚠️ ERRO DE CLIENTE]:');
    console.error(err);
});

// ==========================================
// 📜 CONSTANTES DE RPG (TABELAS DE DADOS)
// ==========================================
function normalizarNome(nome) {
    return nome.normalize('NFD')
               .replace(/[\u0300-\u036f]/g, "") 
               .replace(/[⏝︶⏝⌇]/g, "")         
               .replace(/\s+/g, ' ')            
               .trim()                          
               .toLowerCase();
}

const NOMES_EXIBICAO = {
  'Prodigio': '⭐ Prodígio',
  'Quebra-Maldição': '✨ Quebra-Maldição',
  'Cla-o': '👹 Clã Oni',
  'Cla-h': '👤 Clã Humano',
  'marca-nascença': '☀️ Marca de Nascença',
  'marca-maldiçao': '🩸 Marca da Maldição',
  'Roll-Nichirin': '⚔️ Nichirin',
  'kekkijutsu': '🧬 Kekkijutsu',
  'Marechi': '🧪 Marechi',
  'Sentidos': '👁️ Sentidos',
  'Skip-Treino': '⏳ Skip de Treino',
  'Skip-Alimentacao': '🍖 Skip de Alimentação'
};

const TODOS_ROLLS = [
    'Prodigio', 'Quebra-Maldição', 'Cla-o', 'Cla-h', 'marca-nascença', 
    'marca-maldiçao', 'Roll-Nichirin', 'kekkijutsu', 'Marechi', 'Sentidos',
    'Skip-Treino', 'Skip-Alimentacao'
];

const IMAGEM_PADRAO = 'https://cdn.discordapp.com/attachments/1495980105892368534/1496311568512581843/Demon_slayer_teshirts_coming_soon.jfif';

const CLAS = {
  Tsuyuri: { forca:1100,resistencia:1100,reflexo:1500,velocidade:1500,folego:10200 },
  Inadama: { forca:1300,resistencia:1500,reflexo:1200,velocidade:1100,folego:8500 },
  Kanzaki: { forca:1100,resistencia:1300,reflexo:1300,velocidade:1400,folego:11000 },
  Sakonji: { forca:1200,resistencia:1200,reflexo:1400,velocidade:1300,folego:10000 },
  Ubuyashiki: { forca:1000,resistencia:1100,reflexo:1500,velocidade:1100,folego:9000 },
  Uzui: { forca:1700,velocidade:1600,resistencia:1400,reflexo:1500,folego:16000 },
  Iguro: { forca:1500,velocidade:1600,resistencia:1400,reflexo:1700,folego:14000 },
  Kocho: { forca:1200,velocidade:1600,resistencia:1300,reflexo:1700,folego:15000 },
  Agatsuma: { forca:1400,velocidade:1700,resistencia:1300,reflexo:1700,folego:15000 },
  Hashibira: { forca:1600,velocidade:1500,resistencia:1400,reflexo:1700,folego:15000 },
  Tomioka: { forca:1700,velocidade:1700,resistencia:1700,reflexo:1800,folego:17000 },
  Rengoku: { forca:1900,velocidade:1600,resistencia:1800,reflexo:1600,folego:18800 },
  Kanroji: { forca:1700,velocidade:1800,resistencia:1500,reflexo:1800,folego:18600 },
  Himejima: { forca:2500,velocidade:2000,resistencia:2400,reflexo:2100,folego:22300 },
  Tokito: { forca:2100,velocidade:2300,resistencia:2100,reflexo:2400,folego:22000 },
  Shinazugawa: { forca:2200,velocidade:2100,resistencia:2300,reflexo:2100,folego:22000 },
  Kamado: { forca:2700,velocidade:2600,resistencia:2500,reflexo:2600,folego:26000 },
  Tsugikuni: { forca:2700,velocidade:2600,resistencia:2500,reflexo:2800,folego:27000 },
  Numa: { forca:1200,velocidade:1100,resistencia:1500,reflexo:1000,folego:9000 },
  Yahaba: { forca:1300,velocidade:1100,resistencia:1200,reflexo:1300,folego:9000 },
  Kyogai: { forca:1300,velocidade:1400,resistencia:1200,reflexo:1500,folego:10000 },
  Kirisaki: { forca:1200,velocidade:1500,resistencia:1100,reflexo:1500,folego:11000 },
  Hairo: { forca:1400,velocidade:1200,resistencia:1500,reflexo:1000,folego:12000 },
  Susamaru: { forca:1300,velocidade:1400,resistencia:1200,reflexo:1100,folego:7000 },
  Rui: { forca:1200,velocidade:1200,resistencia:1200,reflexo:1200,folego:10000 },
  Enmu: { forca:1000,velocidade:1400,resistencia:1200,reflexo:1500,folego:15000 },
  Shabanna: { forca:2100,velocidade:2000,resistencia:1900,reflexo:1900,folego:20000 },
  Nakime: { forca:1500,velocidade:1800,resistencia:1400,reflexo:2700,folego:25000 },
  Gyokko: { forca:1900,velocidade:2000,resistencia:1800,reflexo:2000,folego:20000 },
  Hantengu: { forca:1600,velocidade:2000,resistencia:1700,reflexo:2500,folego:25000 },
  Kaigaku: { forca:1800,velocidade:2200,resistencia:1700,reflexo:2000,folego:15000 },
  Douma: { forca:2800,velocidade:2200,resistencia:2700,reflexo:2300,folego:25000 },
  Soyama: { forca:2200,velocidade:2600,resistencia:2900,reflexo:2100,folego:25000 },
  Kibutsuji: { forca:12700,velocidade:12600,resistencia:12800,reflexo:12500,folego:35000 }
};

const CLAS_DISPLAY = {
  Tsuyuri: "⏝︶⏝ ⌇ 🌸 Tsuyuri ⌇ ⏝︶⏝",
  Inadama: "⏝︶⏝ ⌇ ⚡ Inadama ⌇ ⏝︶⏝",
  Kanzaki: "⏝︶⏝ ⌇ 🦋 Kanzaki ⌇ ⏝︶⏝",
  Sakonji: "⏝︶⏝ ⌇ 💧 Sakonji ⌇ ⏝︶⏝",
  Ubuyashiki: "⏝︶⏝ ⌇ 💮 Ubuyashiki ⌇ ⏝︶⏝",
  Uzui: "⏝︶⏝ ⌇ 🎵 Uzui ⌇ ⏝︶⏝",
  Iguro: "⏝︶⏝ ⌇ 🐍 Iguro ⌇ ⏝︶⏝",
  Kocho: "⏝︶⏝ ⌇ 🦋 Kocho ⌇ ⏝︶⏝",
  Agatsuma: "⏝︶⏝ ⌇ ⚡ Agatsuma ⌇ ⏝︶⏝",
  Hashibira: "⏝︶⏝ ⌇ 🐗 Hashibira ⌇ ⏝︶⏝",
  Tomioka: "⏝︶⏝ ⌇ 🌊 Tomioka ⌇ ⏝︶⏝",
  Rengoku: "⏝︶⏝ ⌇ 🔥 Rengoku ⌇ ⏝︶⏝",
  Kanroji: "⏝︶⏝ ⌇ 💗 Kanroji ⌇ ⏝︶⏝",
  Himejima: "⏝︶⏝ ⌇ 🪨 Himejima ⌇ ⏝︶⏝",
  Tokito: "⏝︶⏝ ⌇ 🌫️ Tokito ⌇ ⏝︶⏝",
  Shinazugawa: "⏝︶⏝ ⌇ 🍃 Shinazugawa ⌇ ⏝︶⏝",
  Kamado: "⏝︶⏝ ⌇ ☀️ Kamado ⌇ ⏝︶⏝",
  Tsugikuni: "⏝︶⏝ ⌇ ☀️🌙 Tsugikuni ⌇ ⏝︶⏝",
  Numa: "⏝︶⏝ ⌇ 🌀 Numa ⌇ ⏝︶⏝",
  Yahaba: "⏝︶⏝ ⌇ 👁️ Yahaba ⌇ ⏝︶⏝",
  Kyogai: "⏝︶⏝ ⌇ 🥁 Kyogai ⌇ ⏝︶⏝",
  Kirisaki: "⏝︶⏝ ⌇ 💨 Kirisaki ⌇ ⏝︶⏝",
  Hairo: "⏝︶⏝ ⌇ 🐺 Hairo ⌇ ⏝︶⏝",
  Susamaru: "⏝︶⏝ ⌇ 🏀 Susamaru ⌇ ⏝︶⏝",
  Rui: "⏝︶⏝ ⌇ 🕷️ Rui ⌇ ⏝︶⏝",
  Enmu: "⏝︶⏝ ⌇ 💤 Enmu ⌇ ⏝︶⏝",
  Shabanna: "⏝︶⏝ ⌇ 🩸 Shabanna ⌇ ⏝︶⏝",
  Nakime: "⏝︶⏝ ⌇ 🪕 Nakime ⌇ ⏝︶⏝",
  Gyokko: "⏝︶⏝ ⌇ 🐟 Gyokko ⌇ ⏝︶⏝",
  Hantengu: "⏝︶⏝ ⌇ 👺 Hantengu ⌇ ⏝︶⏝",
  Kaigaku: "⏝︶⏝ ⌇ ⚡ Kaigaku ⌇ ⏝︶⏝",
  Douma: "⏝︶⏝ ⌇ 🧊 Douma ⌇ ⏝︶⏝",
  Soyama: "⏝︶⏝ ⌇ 🥋 Soyama ⌇ ⏝︶⏝",
  Kibutsuji: "⏝︶⏝ ⌇ 👑 Kibutsuji ⌇ ⏝︶⏝"
};

const nomesCargosRespiracao = {
    "⏝︶⏝ ⌇ ☀️Hi no Kokyuu ⌇  ⏝︶⏝": "sol",
    "⏝︶⏝ ⌇ 🌕Tsuki no Kokyuu ⌇  ⏝︶⏝": "lua",
    "⏝︶⏝ ⌇ 🌊Mizu no Kokyuu ⌇  ⏝︶⏝": "agua",
    "⏝︶⏝ ⌇ 💗Koi no Kokyuu ⌇  ⏝︶⏝": "amor",
    "⏝︶⏝ ⌇ 🍃Kaze no Kokyuu ⌇  ⏝︶⏝": "vento",
    "⏝︶⏝ ⌇ 🪨Iwa no Kokyuu ⌇  ⏝︶⏝": "pedra",
    "⏝︶⏝ ⌇ ⚡Kaminari no Kokyuu ⌇  ⏝︶⏝": "trovao",
    "⏝︶⏝ ⌇ 🐗Kedamono no Kokyuu ⌇  ⏝︶⏝": "fera",
    "⏝︶⏝ ⌇ 🦋Mushi no Kokyuu ⌇  ⏝︶⏝": "inseto",
    "⏝︶⏝ ⌇ 🎵Oto no Kokyuu ⌇  ⏝︶⏝": "som",
    "⏝︶⏝ ⌇ 🐍Hebi no Kokyuu ⌇  ⏝︶⏝": "serpente",
    "⏝︶⏝ ⌇ 🔥Hono no Kokyuu ⌇  ⏝︶⏝": "chamas",
    "⏝︶⏝ ⌇ 🌸Hana no Kokyuu ⌇  ⏝︶⏝": "flor",
    "⏝︶⏝ ⌇ 🌫️Kasumi no Kokyuu ⌇  ⏝︶⏝": "nevoa",
    "⏝︶⏝ ⌇ 🌅Hinokami Kagura ⌇  ⏝︶⏝": "Hinokami Kagura",
    "💧 Pilar da Água": "agua",
    "🔥 Pilar das Chamas": "chamas",
    "🌪️ Pilar do Vento": "vento",
    "⚡ Pilar do Trovão": "trovao",
    "☀️ Usuário do Sol": "sol",
    "🌙 Usuário da Lua": "lua",
    "🌫️ Pilar da Névoa": "nevoa",
    "🦋 Pilar do Inseto": "inseto",
    "🌸 Pilar da Flor": "flor",
    "🐍 Pilar da Serpente": "serpente",
    "🪨 Pilar da Pedra": "pedra",
    "🎵 Pilar do Som": "som",
    "🐗 Pilar da Besta": "fera",
    "🌅 Dança do Deus do Fogo": "Hinokami Kagura"
};

const respiracoes = {
  "sol": 1.5, "lua": 1.4, "agua": 1.0, "chamas": 1.1, "vento": 1.1,
  "pedra": 1.2, "trovao": 1.1, "nevoa": 1.1, "inseto": 0.9, "fera": 1.0,
  "som": 1.0, "serpente": 1.0, "amor": 1.0, "flor": 1.0, "Hinokami Kagura": 1.4
};

const limitesRank = {
  "⏝︶⏝ ⌇ 🌌Civil ⌇  ⏝︶⏝": { status: 5000, folego: 50000 },
  "⏝︶⏝ ⌇ ㊗️Mizunoto ⌇  ⏝︶⏝": { status: 20000, folego: 100000 },
  "⏝︶⏝ ⌇ ㊗️Mizunoe ⌇  ⏝︶⏝": { status: 25000, folego: 120000 },
  "⏝︶⏝ ⌇ ㊗️Kanoto ⌇  ⏝︶⏝": { status: 30000, folego: 140000 },
  "⏝︶⏝ ⌇ ㊗️Kanoe ⌇  ⏝︶⏝": { status: 35000, folego: 160000 },
  "⏝︶⏝ ⌇ ㊗️Tsuchinoto ⌇  ⏝︶⏝": { status: 40000, folego: 180000 },
  "⏝︶⏝ ⌇ ㊗️Tsuchinoe ⌇  ⏝︶⏝": { status: 45000, folego: 200000 },
  "⏝︶⏝ ⌇ ㊗️Hinoto ⌇  ⏝︶⏝": { status: 50000, folego: 220000 },
  "⏝︶⏝ ⌇ ㊗️Hinoe ⌇  ⏝︶⏝": { status: 55000, folego: 240000 },
  "⏝︶⏝ ⌇ ㊗️Kinoto ⌇  ⏝︶⏝": { status: 60000, folego: 260000 },
  "⏝︶⏝ ⌇ ㊗️Kinoe ⌇  ⏝︶⏝": { status: 70000, folego: 300000 },
  "⏝︶⏝ ⌇ 💫 Hashira Fraco — 「初柱」 ⌇  ⏝︶⏝": { status: 110000, folego: 540000 },
  "⏝︶⏝ ⌇ 💫 Hashira Medio — 「初柱」 ⌇  ⏝︶⏝": { status: 140000, folego: 720000 },
  "⏝︶⏝ ⌇ 💫 Hashira Forte — 「初柱」 ⌇  ⏝︶⏝": { status: 170000, folego: 900000 },
  "⏝︶⏝ ⌇ 💫 Hashira Historico — 「初柱」 ⌇  ⏝︶⏝": { status: 200000, folego: 1080000 },
  "⏝︶⏝ ⌇ 👻Fraco ⌇  ⏝︶⏝": { status: 25000, folego: 130000 },
  "⏝︶⏝ ⌇ 👿Rogue ⌇  ︶⏝": { status: 30000, folego: 150000 },
  "⏝︶⏝ ⌇ 👿Sakurai ⌇  ⏝︶⏝": { status: 40000, folego: 170000 },
  "⏝︶⏝ ⌇ 👿Yowai ⌇  ⏝︶⏝": { status: 45000, folego: 190000 },
  "⏝︶⏝ ⌇ 👿Heikin ⌇  ⏝︶⏝": { status: 50000, folego: 210000 },
  "⏝︶⏝ ⌇ 👿Jukuren ⌇  ⏝︶⏝": { status: 55000, folego: 230000 },
  "⏝︶⏝ ⌇ ☠️Tsuyoi ⌇  ⏝︶⏝": { status: 60000, folego: 250000 },
  "⏝︶⏝ ⌇ ☠️Seijo ⌇  ⏝︶⏝": { status: 65000, folego: 270000 },
  "⏝︶⏝ ⌇ ☠️Chomei ⌇  ⏝︶⏝": { status: 70000, folego: 290000 },
  "⏝︶⏝ ⌇ 👹Akuma ⌇  ⏝︶⏝": { status: 75000, folego: 310000 },
  "⏝︶⏝ ⌇ 🌘Lua Superior 6 ⌇  ⏝︶⏝": { status: 135000, folego: 570000 },
  "⏝︶⏝ ⌇ 🌓Lua Superior 5 ⌇  ⏝︶⏝": { status: 150000, folego: 620000 },
  "⏝︶⏝ ⌇ 🌗Lua Superior 4 ⌇  ⏝︶⏝": { status: 180000, folego: 670000 },
  "⏝︶⏝ ⌇ 🌖Lua Superior 3 ⌇  ⏝︶⏝": { status: 230000, folego: 770000 },
  "⏝︶⏝ ⌇ 🌔Lua Superior 2 ⌇  ⏝︶⏝": { status: 280000, folego: 820000 },
  "⏝︶⏝ ⌇ 🌕Lua Superior 1 ⌇  ⏝︶⏝": { status: 350000, folego: 920000 },
  "⏝︶⏝ ⌇ 👑 Rei Oni ⌇ ⏝︶⏝": { status: 700000, folego: 1500000 }
};

const habilidadesRoles = {
  "⏝︶⏝ ⌇ 🏋Físico Perfeito ⌇  ⏝︶⏝": { forca: 5000, resistencia: 5000, reflexo: 5000, velocidade: 5000, folego: 5000 },
  "⏝︶⏝ ⌇ 🔥Espírito Indomável ⌇  ⏝︶⏝": { forca: 1500, resistencia: 1500, reflexo: 1500, velocidade: 1500, folego: 1500 },
  "⏝︶⏝ ⌇ 🌐Mundo Transparente ⌇  ⏝︶⏝": { forca: 0, resistencia: 0, reflexo: 35000, velocidade: 35000, folego: 0 },
  "⏝︶⏝ ⌇ 🌬️Estado Altruísta ⌇  ⏝︶⏝": { forca: 0, resistencia: 0, reflexo: 25000, velocidade: 25000, folego: 0 },
  "⏝︶⏝ ⌇ 👹Blood Rage ⌇  ⏝︶⏝": { forca: 40000, resistencia: 40000, reflexo: 40000, velocidade: 40000, folego: 0 }
};

const roleBuffs = {
  "⏝︶⏝ ⌇ 👻Fraco ⌇  ⏝︶⏝": { forca: 750, resistencia: 1000, reflexo: 1500, velocidade: 1500, folego: 10000 },
  "⏝︶⏝ ⌇ ㊗️Mizunoto ⌇  ⏝︶⏝": { forca: 1250, resistencia: 1000, reflexo: 1500, velocidade: 1500, folego: 10000 }
};

const sentidosBuffs = { "Audição Aguçada": { reflexo: 1500 }, "Olfato Aguçado": { reflexo: 1500 }, "Tato Aguçado": { reflexo: 1500 }, "Visão Aguçada": { reflexo: 1500 }, "Todos os Sentidos": { reflexo: 6000 } };
const luckyBoostRoles = { "⏝︶⏝ ⌇ 🍀 Lucky Boost  I ⌇  ⏝︶⏝": 5.00, "⏝︶⏝ ⌇ 🍀 Lucky Boost  II ⌇  ⏝︶⏝": 10.00, "⏝︶⏝ ⌇ 🍀 Lucky Boost III ⌇  ⏝︶⏝": 15.00 };

// ==========================================
// ⚔️ FORMAS DE RESPIRAÇÃO (formasDados)
// ==========================================
const formasDados = {
  sol: [
    { nome: "Primeira Forma — Dança do Pilar de Fogo", descricao: "Um golpe vertical devastador com velocidade relampejante, capaz de cortar qualquer demônio ao meio.", forca: 8000, dano: "Altíssimo" },
    { nome: "Segunda Forma — Dança Solar dos Mil Corvos", descricao: "Ataques giratórios em forma de espiral que cortam o alvo de múltiplos ângulos simultaneamente.", forca: 9500, dano: "Extremo" },
    { nome: "Terceira Forma — Dança do Amanhecer", descricao: "O usuário dispara em linha reta com velocidade máxima, atravessando o adversário como um raio solar.", forca: 7500, dano: "Alto" },
    { nome: "Quarta Forma — Dança Relampejante e Encadeada", descricao: "Série de cortes encadeados em alta velocidade que formam um padrão de fogo girando em torno do inimigo.", forca: 9000, dano: "Extremo" },
    { nome: "Quinta Forma — Arco Solar e Flecha de Chamas", descricao: "Um golpe em arco de baixo para cima que lança energia solar como uma flecha de fogo.", forca: 8500, dano: "Altíssimo" },
    { nome: "Sexta Forma — Halo de Chamas em Chamas", descricao: "O usuário gira o corpo e a lâmina formando um halo de calor ao redor de si, queimando tudo próximo.", forca: 10000, dano: "Devastador" },
    { nome: "Sétima Forma — Pilar de Chamas", descricao: "Ataque vertical com toda a força do usuário, canalizando o calor do sol em um único ponto.", forca: 10500, dano: "Devastador" },
    { nome: "Oitava Forma — Dança do Pôr do Sol", descricao: "Golpe rotativo de 360° com a lâmina envolvida em chamas solares, impossível de defender.", forca: 11000, dano: "Catastrófico" },
    { nome: "Nona Forma — Flamas do Sol", descricao: "O usuário realiza vinte e oito cortes em menos de um segundo, replicando as chamas do próprio sol.", forca: 12000, dano: "Catastrófico" },
    { nome: "Décima Forma — Corpo Solar Incandescente", descricao: "O usuário envolve o próprio corpo em calor solar extremo, tornando cada toque letalmente ardente.", forca: 13000, dano: "Lendário" },
    { nome: "Décima Primeira Forma — Destruição Celeste — Chamas do Sol", descricao: "A forma mais poderosa da respiração do Sol. O usuário canaliza energia solar pura em um único golpe aniquilador.", forca: 18000, dano: "Absoluto" },
    { nome: "Décima Segunda Forma — Dança do Deus do Fogo (Hinokami Kagura)", descricao: "A forma primordial da respiração do Sol, transmitida desde a era dos deuses. Golpe único de poder divino.", forca: 20000, dano: "Divino" }
  ],
  lua: [
    { nome: "Primeira Forma — Incisão da Lua Crescente", descricao: "Um corte em meia-lua que projeta uma onda de energia sombria capaz de atravessar armaduras.", forca: 7500, dano: "Alto" },
    { nome: "Segunda Forma — Lua Pérola e Anel de Prata", descricao: "Ataque circular que gera ondas de energia negra ao redor do usuário, cortando tudo em seu raio.", forca: 8500, dano: "Altíssimo" },
    { nome: "Terceira Forma — Dança da Lua Fria", descricao: "Série de cortes em zigue-zague que mimetizam a luz fria da lua, confundindo o adversário.", forca: 7000, dano: "Alto" },
    { nome: "Quarta Forma — Dança da Lua Sangrenta", descricao: "O usuário realiza cortes verticais e horizontais com energia da lua cheia, cada golpe drenando a vitalidade do inimigo.", forca: 9000, dano: "Extremo" },
    { nome: "Quinta Forma — Antítese", descricao: "Habilidade única: inverte as posições do atacante e do alvo num instante, tornando qualquer defesa inútil.", forca: 10000, dano: "Extremo" },
    { nome: "Sexta Forma — Maré de Lua Obscura", descricao: "Cria múltiplos arcos de energia sombria que se expandem em todas as direções como uma maré negra.", forca: 11000, dano: "Devastador" },
    { nome: "Sétima Forma — Lua Nova — Névoa Escarlate", descricao: "Envolve a área em névoa sombria e lança golpes invisíveis de dentro da escuridão.", forca: 12000, dano: "Catastrófico" },
    { nome: "Oitava Forma — Lua Dupla — Flores de Neve Vermelhas", descricao: "Ataque com dois arcos simultâneos de energia lunar, convergindo no alvo de ângulos opostos.", forca: 13000, dano: "Catastrófico" },
    { nome: "Nona Forma — Lua Sangrenta — Destruição Total", descricao: "O usuário concentra toda a energia lunar em um único ponto e libera num golpe devastador.", forca: 15000, dano: "Lendário" },
    { nome: "Décima Forma — Eclipse Total — Lua de Sangue", descricao: "A forma suprema da Lua. O usuário se transforma num projétil de energia sombria, aniquilando o alvo.", forca: 18000, dano: "Absoluto" }
  ],
  agua: [
    { nome: "Primeira Forma — Ondulação Superficial", descricao: "Um corte rápido e fluido que se adapta a qualquer defesa do adversário como a água em torno de uma pedra.", forca: 3500, dano: "Médio" },
    { nome: "Segunda Forma — Dança das Águas", descricao: "Ataques contínuos e fluidos que nunca param, como uma correnteza que desgasta qualquer obstáculo.", forca: 4500, dano: "Médio-Alto" },
    { nome: "Terceira Forma — Fluxo Tortuoso", descricao: "O usuário torce o corpo e a lâmina em uma trajetória imprevisível, tornando o ataque impossível de prever.", forca: 5000, dano: "Alto" },
    { nome: "Quarta Forma — Pressão Inabalável", descricao: "Golpe de alta pressão que aplica força concentrada como a profundeza do oceano sobre o adversário.", forca: 5500, dano: "Alto" },
    { nome: "Quinta Forma — Corrente de Maré", descricao: "Ataque em espiral que arrasta o adversário como uma maré poderosa, desorientando e ferindo simultaneamente.", forca: 6000, dano: "Alto" },
    { nome: "Sexta Forma — Torrente Constante", descricao: "Série interminável de cortes que não dão ao adversário nenhuma abertura para contra-atacar.", forca: 6500, dano: "Altíssimo" },
    { nome: "Sétima Forma — Gota de Chuva Caindo", descricao: "Um golpe em queda livre com velocidade e precisão de uma gota de chuva — simples, mas impossível de desviar.", forca: 5800, dano: "Alto" },
    { nome: "Oitava Forma — Macarrão de Polvo", descricao: "O usuário flexibiliza braços e torso ao máximo, realizando ataques de ângulos impossíveis e surpreendentes.", forca: 5500, dano: "Alto" },
    { nome: "Nona Forma — Splendid Clarity", descricao: "O usuário acelera ao máximo por um instante, cobrindo longa distância com um único corte devastador.", forca: 7000, dano: "Altíssimo" },
    { nome: "Décima Forma — Turbilhão de Fluxo Constante", descricao: "Rotação contínua do corpo com a lâmina estendida, criando um vórtice de cortes ao redor do usuário.", forca: 7500, dano: "Altíssimo" },
    { nome: "Décima Primeira Forma — Calma Mortal", descricao: "A forma mais rara. O usuário atinge estado de calma absoluta, e cada golpe é executado com perfeição letal.", forca: 9000, dano: "Extremo" }
  ],
  chamas: [
    { nome: "Primeira Forma — Chama Não Perecível", descricao: "Um golpe vertical que nunca vacila, como uma chama que arde mesmo contra o vento.", forca: 4000, dano: "Médio-Alto" },
    { nome: "Segunda Forma — Ascensão ao Cume das Chamas", descricao: "O usuário salta verticalmente e golpeia de cima, como uma chama que escala o céu.", forca: 5000, dano: "Alto" },
    { nome: "Terceira Forma — Tigre Devorador de Chamas", descricao: "Avanço em linha reta com velocidade explosiva, o usuário arremessa a lâmina como um tigre em chamas.", forca: 6000, dano: "Altíssimo" },
    { nome: "Quarta Forma — Rugido Carmesim", descricao: "O usuário solta uma onda de energia de chamas que arde em tudo que toca, como um rugido de fogo.", forca: 6500, dano: "Altíssimo" },
    { nome: "Quinta Forma — Tigre das Chamas — Gritos do Inferno", descricao: "Série de golpes explosivos com calor crescente a cada ataque, culminando em um golpe final avassalador.", forca: 7500, dano: "Extremo" },
    { nome: "Nona Forma — Pilares de Chamas Eternas", descricao: "A forma mais poderosa do Pilar do Fogo. O usuário concentra toda a sua vida em um único golpe de chamas.", forca: 10000, dano: "Devastador" }
  ],
  vento: [
    { nome: "Primeira Forma — Brisa Explosiva", descricao: "Um corte relampejante horizontal que gera pressão de vento capaz de desestabilizar qualquer adversário.", forca: 4000, dano: "Médio-Alto" },
    { nome: "Segunda Forma — Vórtice de Ramos Quebrando", descricao: "O usuário gira e golpeia em todas as direções, quebrando qualquer defesa como galhos ao vento.", forca: 5000, dano: "Alto" },
    { nome: "Terceira Forma — Redemoinhos Côncavos", descricao: "Golpe curvado que cria um vórtice de vento que suga e corta o adversário simultaneamente.", forca: 5500, dano: "Alto" },
    { nome: "Quarta Forma — Ressaca de Vento Incontrolável", descricao: "O usuário canaliza o vento em uma ressaca devastadora que varre tudo em seu caminho.", forca: 6000, dano: "Altíssimo" },
    { nome: "Quinta Forma — Ressaca de Vento — Furacão Assassino", descricao: "Ataque em espiral que gera um furacão miniatura, arrastando o adversário para dentro do redemoinho.", forca: 6800, dano: "Altíssimo" },
    { nome: "Sétima Forma — Ciclone Árido", descricao: "O usuário gira o próprio corpo a velocidade extrema, tornando-se um ciclone vivo de cortes.", forca: 7500, dano: "Extremo" },
    { nome: "Nona Forma — Vento Uivante — Tempestade de Areia", descricao: "Forma final do Pilar do Vento. Envolve o adversário em uma tempestade de areia e vento, cortando de todos os lados.", forca: 9500, dano: "Devastador" }
  ],
  pedra: [
    { nome: "Primeira Forma — Força da Terra", descricao: "Um golpe simples e brutalmente poderoso que concentra a força de uma montanha em um único ponto.", forca: 5000, dano: "Alto" },
    { nome: "Quarta Forma — Avalanche de Pedra", descricao: "O usuário arremessa a lâmina com força tectônica, partindo qualquer defesa como pedras numa avalanche.", forca: 7000, dano: "Altíssimo" },
    { nome: "Quinta Forma — Colapso de Rocha", descricao: "Uma série de golpes devastadores que esmagam o adversário como uma rocha desabando do cume.", forca: 8000, dano: "Extremo" },
    { nome: "Sétima Forma — Rocha Celestial — Grande Templo", descricao: "A forma mais poderosa da pedra. O usuário golpeia com uma força que pode partir rochas imensas ao meio.", forca: 12000, dano: "Catastrófico" }
  ],
  trovao: [
    { nome: "Primeira Forma — Couro Cabeludo do Trovão", descricao: "Avanço relampejante de velocidade extrema — o usuário some do campo de visão do adversário antes de golpear.", forca: 5500, dano: "Alto" },
    { nome: "Segunda Forma — Seis Ceifadores Relâmpago", descricao: "Seis golpes em sequência com velocidade de raio, cada um mais rápido que o anterior.", forca: 6500, dano: "Altíssimo" },
    { nome: "Terceira Forma — Tambores do Raio", descricao: "Cortes explosivos que soam como trovões, desorientando o adversário com a pressão sonora.", forca: 6000, dano: "Altíssimo" },
    { nome: "Quarta Forma — Relâmpago Eterno", descricao: "O usuário se move em velocidade impossível de rastrear, realizando múltiplos cortes em frações de segundo.", forca: 7000, dano: "Extremo" },
    { nome: "Quinta Forma — Calor do Relâmpago", descricao: "Combina velocidade extrema com força explosiva, cada golpe gerando calor equivalente a um raio.", forca: 7500, dano: "Extremo" },
    { nome: "Sexta Forma — Escala", descricao: "Forma exclusiva de Zenitsu. O usuário cai em sono e executa automaticamente a forma mais poderosa do trovão.", forca: 10000, dano: "Devastador" }
  ],
  nevoa: [
    { nome: "Primeira Forma — Névoa Não Cortante", descricao: "Um corte que engana o adversário — parece lento, mas envolve a lâmina num padrão errático e letal.", forca: 4000, dano: "Médio" },
    { nome: "Segunda Forma — Névoa em Oito Direções", descricao: "Golpes em oito direções simultâneas, tornando qualquer esquiva praticamente impossível.", forca: 5000, dano: "Alto" },
    { nome: "Terceira Forma — Névoa Ilusória", descricao: "O usuário faz movimentos de distração enquanto o golpe real vem de uma direção inesperada.", forca: 5500, dano: "Alto" },
    { nome: "Quarta Forma — Névoa Caindo — Corte Lunar", descricao: "O usuário desce sobre o adversário como névoa, um corte em arco descendente difícil de prever.", forca: 6000, dano: "Altíssimo" },
    { nome: "Sétima Forma — Névoa Evasiva — Morte Enevoada", descricao: "A forma mais letal da Névoa. O usuário desaparece completamente e surge atrás do adversário num instante.", forca: 9000, dano: "Extremo" }
  ],
  inseto: [
    { nome: "Dança da Borboleta", descricao: "Movimentos erráticos e imprevisíveis que se assemelham ao voo de uma borboleta, difíceis de prever e desviar.", forca: 4000, dano: "Médio" },
    { nome: "Dança da Abelha — Picada de Veneno", descricao: "A lâmina é usada como um ferrão, injetando uma toxina especial que corrói o corpo do adversário.", forca: 5000, dano: "Alto + Veneno" },
    { nome: "Dança da Libelinha — Desvio Perpétuo", descricao: "O usuário se esquiva continuamente e contra-ataca com precisão cirúrgica, como uma libelinha perseguindo presa.", forca: 5500, dano: "Alto" },
    { nome: "Dança da Centopéia — Enrolamento Supremo", descricao: "O usuário envolve o adversário numa série de cortes em espiral, impossibilitando qualquer defesa.", forca: 6500, dano: "Altíssimo" }
  ],
  fera: [
    { nome: "Primeira Forma — Garra Dilacerante", descricao: "Dois cortes simultâneos em diagonal que imitam as garras de uma fera selvagem.", forca: 5000, dano: "Alto" },
    { nome: "Segunda Forma — Presas do Lobo", descricao: "Ataque corpo a corpo de extrema velocidade e brutalidade, o usuário se joga sobre o adversário como um lobo.", forca: 6000, dano: "Altíssimo" },
    { nome: "Terceira Forma — Sangue da Besta", descricao: "Cortes frenéticos que aumentam em velocidade e fúria, como um animal em estado de frenesi.", forca: 6500, dano: "Altíssimo" },
    { nome: "Quarta Forma — Galope Estelar", descricao: "O usuário galopa em alta velocidade e golpeia com toda a inércia do movimento, devastador.", forca: 7000, dano: "Extremo" },
    { nome: "Quinta Forma — Morte da Fera", descricao: "Forma especial criada por Inosuke. Pressão tectônica detectada pelas mãos, golpe no ponto fraco do adversário.", forca: 8000, dano: "Extremo" },
    { nome: "Décima Forma — Matança da Fera", descricao: "Dezenas de cortes por segundo em todas as direções, o usuário entra em modo de frenesi total.", forca: 10000, dano: "Devastador" }
  ],
  som: [
    { nome: "Primeira Forma — Rugido Esplêndido", descricao: "O usuário emite um golpe poderoso acompanhado de uma onda sonora que atordoa o adversário.", forca: 5500, dano: "Alto" },
    { nome: "Segunda Forma — Som da Percussão", descricao: "Golpes ritmados que confundem os reflexos do adversário com variação de tempo e intensidade.", forca: 6000, dano: "Altíssimo" },
    { nome: "Terceira Forma — Reverberação Constante", descricao: "Uma série de golpes que reverberam no corpo do adversário, aumentando o dano a cada impacto.", forca: 6500, dano: "Altíssimo" },
    { nome: "Quarta Forma — Melodia Explosiva", descricao: "Técnica final de Uzui. O usuário realiza golpes sincronizados que explodem no alvo como uma melodia final.", forca: 9500, dano: "Devastador" }
  ],
  serpente: [
    { nome: "Primeira Forma — Torção da Serpente", descricao: "O corpo se contorce de forma impossível, permitindo atacar de ângulos que nenhum outro estilo alcança.", forca: 4500, dano: "Médio-Alto" },
    { nome: "Segunda Forma — Anel de Cobra", descricao: "O usuário envolve o adversário em um padrão circular de cortes, prendendo-o como uma cobra.", forca: 5500, dano: "Alto" },
    { nome: "Terceira Forma — Presas da Cobra", descricao: "Dois golpes em rápida sucessão, imitando o bote de uma cobra — rápido, preciso e letal.", forca: 6000, dano: "Altíssimo" },
    { nome: "Quarta Forma — Serpente Dançante — Morder a Cabeça", descricao: "O usuário circula o adversário e golpeia a parte mais vulnerável numa trajetória em espiral.", forca: 7500, dano: "Extremo" },
    { nome: "Quinta Forma — Serpente Mortal", descricao: "Forma final de Iguro. O usuário e a cobra Kaburamaru atuam em sincronia perfeita — golpe irresistível.", forca: 9000, dano: "Devastador" }
  ],
  amor: [
    { nome: "Primeira Forma — Expiração Suave", descricao: "Um corte delicado mas de precisão cirúrgica, que encontra a abertura perfeita em qualquer defesa.", forca: 4500, dano: "Médio-Alto" },
    { nome: "Segunda Forma — Borbulhar de Amor", descricao: "Movimentos fluidos e graciosos que confundem o adversário com sua beleza antes de golpear.", forca: 5500, dano: "Alto" },
    { nome: "Terceira Forma — Corrente de Amor", descricao: "A flexibilidade extrema de Mitsuri permite cortes em ângulos impossíveis que ninguém mais consegue executar.", forca: 6500, dano: "Altíssimo" },
    { nome: "Quarta Forma — Redemoinho Eterno", descricao: "Giro contínuo do corpo criando uma espiral de cortes ao redor do usuário — impossível de se aproximar.", forca: 7000, dano: "Altíssimo" },
    { nome: "Quinta Forma — Flutuação do Amor", descricao: "O usuário se projeta com a lâmina estendida em um arco enorme, cobrindo grande área de dano.", forca: 8000, dano: "Extremo" },
    { nome: "Sexta Forma — Amor Infinito", descricao: "A forma suprema de Kanroji. Múltiplos cortes em velocidade impossível de acompanhar, a lâmina flexível envolve o alvo.", forca: 10000, dano: "Devastador" }
  ],
  flor: [
    { nome: "Primeira Forma — Dança da Glicínea", descricao: "Um corte suave mas mortal que imita a queda das pétalas de glicínia sobre o adversário.", forca: 4000, dano: "Médio" },
    { nome: "Segunda Forma — Pétala Giratória", descricao: "O usuário gira e dispersa uma série de cortes que se espalham como pétalas ao vento.", forca: 5000, dano: "Alto" },
    { nome: "Terceira Forma — Flor Caindo — Dança da Borboleta", descricao: "O usuário move-se entre os golpes do adversário com graça, contratatacando com precisão mortal.", forca: 5500, dano: "Alto" },
    { nome: "Quarta Forma — Dança Celestial — Flores de Cerejeira", descricao: "Uma explosão de cortes simultâneos que imitam a queda em massa das flores de cerejeira.", forca: 7000, dano: "Extremo" },
    { nome: "Quinta Forma — Esplendor Eterno — Sakura Caindo", descricao: "A forma suprema da Respiração da Flor. O usuário dança e golpeia em perfeição absoluta.", forca: 9000, dano: "Devastador" }
  ],
  "Hinokami Kagura": [
    { nome: "Dança do Deus do Fogo — Primeiro Movimento", descricao: "A dança primordial transmitida através das gerações dos Kamado. Um golpe de poder divino que queima qualquer demônio.", forca: 15000, dano: "Lendário" },
    { nome: "Dança do Deus do Fogo — Arco de Chamas Circulares", descricao: "Um arco de fogo divino que envolve o adversário e o queima por dentro com calor sobrenatural.", forca: 16000, dano: "Lendário" },
    { nome: "Dança do Deus do Fogo — Chamas Explosivas", descricao: "O usuário concentra toda a energia solar em seus pulmões e explode em chamas divinas ao redor de si.", forca: 17000, dano: "Absoluto" },
    { nome: "Dança do Deus do Fogo — Forma Suprema", descricao: "A forma final e mais poderosa. O usuário transcende os limites humanos e lança um golpe de luz solar pura.", forca: 22000, dano: "Divino" }
  ]
};

// ==========================================
// 🧬 TÉCNICAS KEKKIJUTSU (kekkiDados)
// ==========================================
const kekkiDados = {
  sangue: [
    { nome: "Explosão Sanguínea — Primeira Forma", descricao: "O usuário expele sangue sob alta pressão, criando uma explosão que queima e corta o adversário.", forca: 6000, dano: "Altíssimo" },
    { nome: "Explosão Sanguínea — Segunda Forma — Rastro Carmesim", descricao: "Uma trilha de sangue explosivo é lançada na direção do adversário, detonando ao contato.", forca: 7000, dano: "Extremo" },
    { nome: "Explosão Sanguínea — Terceira Forma — Nova Sangrenta", descricao: "O usuário detona o sangue ao redor de si, criando uma explosão esférica que destrói tudo em seu raio.", forca: 8500, dano: "Devastador" },
    { nome: "Arte Sanguínea — Manipulação de Coágulos", descricao: "O usuário solidifica o próprio sangue em projéteis cortantes que são disparados contra o alvo.", forca: 5500, dano: "Alto" },
    { nome: "Arte Sanguínea — Flagelo Carmesim", descricao: "O sangue é convertido em um chicote de energia que pode se estender e golpear em longas distâncias.", forca: 7500, dano: "Extremo" }
  ],
  veneno: [
    { nome: "Arte do Veneno — Névoa Tóxica", descricao: "O usuário expele uma névoa de veneno mortal que afeta o sistema nervoso de qualquer ser vivo próximo.", forca: 4000, dano: "Médio + Paralisação" },
    { nome: "Arte do Veneno — Esferas Corrosivas", descricao: "Projéteis de veneno concentrado que corroem armaduras, carne e ossos ao contato.", forca: 5000, dano: "Alto + Corrosão" },
    { nome: "Arte do Veneno — Raízes da Morte", descricao: "Tentáculos de veneno solidificado penetram o solo e emergem sob o adversário, paralisando e envenenando.", forca: 6000, dano: "Altíssimo + Veneno" }
  ],
  osso: [
    { nome: "Arte Óssea — Projétil de Osso", descricao: "O usuário dispara ossos afiados de seu próprio corpo como projéteis de alta velocidade.", forca: 5000, dano: "Alto" },
    { nome: "Arte Óssea — Lança de Fêmur", descricao: "Uma longa lança feita de osso reforçado é criada e arremessada com força letal.", forca: 6500, dano: "Altíssimo" },
    { nome: "Arte Óssea — Fortaleza de Marfim", descricao: "O usuário cria uma armadura de ossos ao redor do corpo, aumentando drasticamente a resistência.", forca: 4000, dano: "Defensivo" },
    { nome: "Arte Óssea — Morte Espinhosa", descricao: "Ossos afiados emergem em todas as direções do corpo do usuário, tornando qualquer contato letal.", forca: 7500, dano: "Extremo" }
  ],
  espinhos: [
    { nome: "Arte dos Espinhos — Corrente de Vidro", descricao: "Uma corrente de cristais cortantes é lançada em alta velocidade contra o adversário.", forca: 5500, dano: "Alto" },
    { nome: "Arte dos Espinhos — Prisão de Cristal", descricao: "O usuário cria uma gaiola de espinhos de cristal ao redor do adversário, aprisionando-o.", forca: 6000, dano: "Altíssimo" },
    { nome: "Arte dos Espinhos — Tempestade de Lâminas", descricao: "Milhares de fragmentos de cristal são dispersados em alta velocidade, cortando qualquer alvo na área.", forca: 8000, dano: "Devastador" }
  ]
};

function pegarLuckyBoostAcumulativo(member) {
    let boostTotal = 1.0; if (!member) return boostTotal;
    member.roles.cache.forEach(role => { if (luckyBoostRoles[role.name]) { boostTotal += (luckyBoostRoles[role.name] - 1.0); } });
    return boostTotal;
}

function loadJSON(path) { try { if (!fs.existsSync(path)) fs.writeFileSync(path, '{}'); return JSON.parse(fs.readFileSync(path, 'utf8') || '{}'); } catch (e) { return {}; } }
function ensureJSON(filePath, fallback = '{}') {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback);
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || fallback);
  } catch (e) {
    return JSON.parse(fallback);
  }
}
const loadPlayers = () => loadJSON('./players.json');
const loadTitles = () => loadJSON('./titles.json');
const savePlayers = (data) => fs.writeFileSync('./players.json', JSON.stringify(data, null, 2));
const saveTitles = (data) => fs.writeFileSync('./titles.json', JSON.stringify(data, null, 2));
const loadGeral = () => JSON.parse(fs.readFileSync('./geral.json', 'utf8') || '{"selecao":[]}');
const saveGeral = (data) => fs.writeFileSync('./geral.json', JSON.stringify(data, null, 4));
const loadHashiras = () => JSON.parse(fs.readFileSync('./hashiras.json', 'utf8') || '{}');
const saveHashiras = (data) => fs.writeFileSync('./hashiras.json', JSON.stringify(data, null, 2));
const loadCodes = () => JSON.parse(fs.readFileSync('./codes.json', 'utf8') || '{}');
const saveCodes = (data) => fs.writeFileSync('./codes.json', JSON.stringify(data, null, 2));
const loadAprendizes = () => JSON.parse(fs.readFileSync('./aprendizes.json', 'utf8') || '{}');
const saveAprendizes = (data) => fs.writeFileSync('./aprendizes.json', JSON.stringify(data, null, 2));
const DATA_FILES = [
  ['players.json', '{}'],
  ['titles.json', '{}'],
  ['geral.json', '{"selecao":[]}'],
  ['hashiras.json', '{}'],
  ['codes.json', '{}'],
  ['aprendizes.json', '{}']
];

function garantirArquivosDados() {
  for (const [file, fallback] of DATA_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback);
  }
}

function iniciarHealthServer() {
  const port = Number(process.env.PORT || 3000);
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bot online');
  });
  server.listen(port, '0.0.0.0');
}

function iniciarAutosave() {
  setInterval(() => {
    try {
      garantirArquivosDados();
      const players = loadPlayers();
      const titles = loadTitles();
      const geral = ensureJSON('./geral.json', '{"selecao":[]}');
      const hashiras = loadHashiras();
      const codes = loadCodes();
      const aprendizes = loadAprendizes();
      savePlayers(players);
      saveTitles(titles);
      saveGeral(geral);
      saveHashiras(hashiras);
      saveCodes(codes);
      saveAprendizes(aprendizes);
    } catch (err) {
      console.error('Falha no autosave:', err);
    }
  }, 60_000);
}

function getPlayer(id) {
  let data = loadPlayers();
  if (!data[id]) {
    data[id] = { forca: 0, resistencia: 0, reflexo: 0, velocidade: 0, folego: 0, vida: 0, respiracao: 'nenhuma', maestria: 0, kills: 0, ienes: 0, sentidos: { olfato: 0, audicao: 0, visao: 0, tato: 0, paladar: 0 }, medicina: { lirioAzul: 0, lirioVermelho: 0, sangueLivre: 0, sangueSuperior: 0, sangueInferior: 0, sangueAkuma: 0, compostos: { c1: false, c2: false, c3: false, c4: false } }, lacos: { amizade: [], rivalidade: [], dupla: null }, rolls: {}, cooldowns: {}, iniciou: false };
  }
  return data[id];
}

function pegarRespiracaoPorCargo(member) {
    if (!member) return 'nenhuma'; let resp = 'nenhuma';
    member.roles.cache.forEach(role => {
        const nomeLimpoCargo = normalizarNome(role.name);
        for (const [cargoOriginal, valorResp] of Object.entries(nomesCargosRespiracao)) {
            if (normalizarNome(cargoOriginal) === nomeLimpoCargo) { resp = valorResp; }
        }
    });
    return resp;
}

function pegarClaPorCargo(member) {
    if (!member) return null; let claEncontrado = null;
    member.roles.cache.forEach(role => {
        const nomeLimpoCargo = normalizarNome(role.name);
        for (const [claName, displayString] of Object.entries(CLAS_DISPLAY)) {
            if (normalizarNome(displayString) === nomeLimpoCargo || normalizarNome(claName) === nomeLimpoCargo) { claEncontrado = claName; }
        }
    });
    return claEncontrado;
}

function calcularTotal(player, member, titles) {
    let total = {
        forca: Number(player.forca) || 0, resistencia: Number(player.resistencia) || 0,
        reflexo: Number(player.reflexo) || 0, velocidade: Number(player.velocidade) || 0,
        folego: Number(player.folego) || 0, vida: 1000
    };

    if (member && member.roles) {
        member.roles.cache.forEach(role => {
            const nomeLimpo = normalizarNome(role.name);
            for (const [key, b] of Object.entries(roleBuffs)) {
                if (normalizarNome(key) === nomeLimpo) {
                    total.forca += (b.forca || 0); total.resistencia += (b.resistencia || 0);
                    total.reflexo += (b.reflexo || 0); total.velocidade += (b.velocidade || 0);
                    total.folego += (b.folego || 0); total.vida += (b.vida || 0);
                }
            }
            for (const [key, b] of Object.entries(habilidadesRoles)) {
                if (normalizarNome(key) === nomeLimpo) {
                    total.forca += (b.forca || 0); total.resistencia += (b.resistencia || 0);
                    total.reflexo += (b.reflexo || 0); total.velocidade += (b.velocidade || 0);
                    total.folego += (b.folego || 0); total.vida += (b.vida || 0);
                }
            }
        });
    }

    if (player.titulo && titles && titles[player.titulo]) {
        const tb = titles[player.titulo];
        total.forca += (tb.forca || 0); total.resistencia += (tb.resistencia || 0);
        total.reflexo += (tb.reflexo || 0); total.velocidade += (tb.velocidade || 0);
    }

    const allStatusBase = total.forca + total.resistencia + total.reflexo + total.velocidade;
    const multiplicador = Math.floor(allStatusBase / 20000);

    if (multiplicador > 0 && member) {
        if (member.roles.cache.some(r => normalizarNome(r.name).includes("marca nascença"))) {
            total.forca += multiplicador * 5000; total.resistencia += multiplicador * 5000;
            total.velocidade += multiplicador * 4500; total.reflexo += multiplicador * 4500;
        } else if (member.roles.cache.some(r => normalizarNome(r.name).includes("marca maldicao"))) {
            total.forca += multiplicador * 2500; total.resistencia += multiplicador * 2000;
            total.velocidade += multiplicador * 2000; total.reflexo += multiplicador * 2000;
        }
    }

    const nivelM = Math.min(Math.floor((player.maestria || 0) / 5000), 20);
    const multiResp = respiracoes[player.respiracao] || 1.0;
    const bonusMaestria = Math.floor(nivelM * multiResp * 500);
    
    total.forca += bonusMaestria; total.resistencia += bonusMaestria;
    total.velocidade += bonusMaestria; total.reflexo += bonusMaestria;

    return total;
}

// ==========================================
// ✅ EVENTO: BOT ONLINE
// ==========================================
client.once('clientReady', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servidores conectados: ${client.guilds.cache.size}`);
  client.user.setActivity('c!help | Demon Slayer RPG', { type: 3 });
});

// ==========================================
// 🎲 TABELAS DE ROLL E DADOS AUXILIARES
// ==========================================
const CLAS_HUMANOS_ROLL = [
  { nome:'Tsuyuri',peso:8 },{ nome:'Inadama',peso:7 },{ nome:'Kanzaki',peso:7 },
  { nome:'Sakonji',peso:7 },{ nome:'Ubuyashiki',peso:6 },{ nome:'Uzui',peso:5 },
  { nome:'Iguro',peso:5 },{ nome:'Kocho',peso:5 },{ nome:'Agatsuma',peso:5 },
  { nome:'Hashibira',peso:5 },{ nome:'Tomioka',peso:4 },{ nome:'Rengoku',peso:4 },
  { nome:'Kanroji',peso:4 },{ nome:'Himejima',peso:2 },{ nome:'Tokito',peso:2 },
  { nome:'Shinazugawa',peso:2 },{ nome:'Kamado',peso:1 },{ nome:'Tsugikuni',peso:1 }
];
const CLAS_ONIS_ROLL = [
  { nome:'Numa',peso:9 },{ nome:'Yahaba',peso:8 },{ nome:'Kyogai',peso:8 },
  { nome:'Kirisaki',peso:8 },{ nome:'Hairo',peso:7 },{ nome:'Susamaru',peso:7 },
  { nome:'Rui',peso:6 },{ nome:'Enmu',peso:5 },{ nome:'Shabanna',peso:4 },
  { nome:'Nakime',peso:4 },{ nome:'Gyokko',peso:4 },{ nome:'Hantengu',peso:4 },
  { nome:'Kaigaku',peso:3 },{ nome:'Douma',peso:2 },{ nome:'Soyama',peso:2 },
  { nome:'Kibutsuji',peso:1 }
];
const NICHIRIN_CORES = [
  { cor:'✨ Transparente — Lâmina Nula',     raridade:'⚡ MÍTICA',   emoji:'✨', peso:1  },
  { cor:'🖤 Negro-Ônix — Garra da Morte',    raridade:'🌟 LENDÁRIA', emoji:'🖤', peso:3  },
  { cor:'🩷 Carmesim-Absoluto',              raridade:'🌟 LENDÁRIA', emoji:'🩷', peso:3  },
  { cor:'🔴 Vermelho-Sangue',               raridade:'🔮 ÉPICA',    emoji:'🔴', peso:5  },
  { cor:'🟠 Laranja-Chamas',                raridade:'🔮 ÉPICA',    emoji:'🟠', peso:6  },
  { cor:'🟡 Amarelo-Sol',                   raridade:'🔮 ÉPICA',    emoji:'🟡', peso:6  },
  { cor:'💙 Índigo-Tempestade',              raridade:'🔮 ÉPICA',    emoji:'💙', peso:6  },
  { cor:'🟢 Verde-Esmeralda',               raridade:'💎 RARA',     emoji:'🟢', peso:9  },
  { cor:'🔵 Azul-Oceano',                   raridade:'💎 RARA',     emoji:'🔵', peso:9  },
  { cor:'🟣 Violeta-Trovão',                raridade:'💎 RARA',     emoji:'🟣', peso:8  },
  { cor:'🌸 Rosa-Flor',                     raridade:'🔹 INCOMUM',  emoji:'🌸', peso:12 },
  { cor:'⚪ Branco-Névoa',                  raridade:'🔹 INCOMUM',  emoji:'⚪', peso:12 },
  { cor:'🩶 Cinza-Pedra',                   raridade:'⬜ COMUM',    emoji:'🩶', peso:15 },
  { cor:'🟫 Marrom-Terra',                  raridade:'⬜ COMUM',    emoji:'🟫', peso:15 }
];
const SENTIDOS_LISTA = [
  { nome:'Visão Aguçada',    emoji:'👁️', descricao:'Enxerga movimentos e trajetórias com precisão sobrenatural.', peso:25 },
  { nome:'Olfato Aguçado',   emoji:'👃', descricao:'Rastreia qualquer ser vivo por quilômetros de distância.',    peso:25 },
  { nome:'Audição Aguçada',  emoji:'👂', descricao:'Ouve batimentos cardíacos e sussurros a grandes distâncias.', peso:25 },
  { nome:'Tato Aguçado',     emoji:'🤲', descricao:'Detecta vibrações e variações de pressão mínimas.',           peso:20 },
  { nome:'Todos os Sentidos',emoji:'✨', descricao:'Todos os sentidos aguçados ao limite máximo da biologia.',     peso:5  }
];
const LOJA_ITENS = {
  escopeta: { nome:'🔫 Escopeta Nichirin', preco:15000, descricao:'Arma especial. Dispara 2 tiros de Nichirin por missão.' },
  bala:     { nome:'🔴 Carga Carmesim',    preco:3000,  descricao:'Munição especial para a Escopeta Nichirin.' },
  potion:   { nome:'🧪 Poção de Recuperação', preco:5000, descricao:'Recupera 20% do seu HP máximo no combate.' },
  amuleto:  { nome:'🪬 Amuleto de Proteção',  preco:8000, descricao:'Reduz 10% do dano recebido por 1 missão.' }
};
const LOJA_VIP = {
  'roll-cla':    { nome:'🎴 Roll de Clã Extra',      kcoins:50,  descricao:'Tenta trocar seu Clã na roleta.' },
  'roll-nichirin':{ nome:'⚔️ Roll Nichirin Extra',   kcoins:30,  descricao:'Tenta trocar a cor da sua Lâmina.' },
  'roll-sentido':{ nome:'👁️ Roll de Sentido Extra', kcoins:40,  descricao:'Tenta trocar seu Sentido.' },
  'skip-treino': { nome:'⏳ Skip de Treino',         kcoins:20,  descricao:'Pula o cooldown de 1 treino.' },
  'skip-aliment':{ nome:'🍖 Skip de Alimentação',   kcoins:20,  descricao:'Pula o cooldown de alimentação.' },
  'lucky-i':     { nome:'🍀 Lucky Boost I',          kcoins:100, descricao:'+5% de chance em todos os rolls.' },
  'lucky-ii':    { nome:'🍀 Lucky Boost II',         kcoins:200, descricao:'+10% de chance em todos os rolls.' },
  'lucky-iii':   { nome:'🍀 Lucky Boost III',        kcoins:400, descricao:'+15% de chance em todos os rolls.' }
};
const FABRICAR_COMPOSTOS = {
  1:{ nome:'🧪 Composto Básico (C1)',   ing:{ lirioAzul:2,lirioVermelho:1 },            efeito:'Paralisa o alvo por 1 turno.' },
  2:{ nome:'🟣 Composto Tóxico (C2)',   ing:{ lirioAzul:3,sangueLivre:2 },              efeito:'Envenena o alvo causando dano por 3 turnos.' },
  3:{ nome:'🔴 Composto Carmesim (C3)', ing:{ lirioVermelho:3,sangueInferior:2 },       efeito:'Dano massivo no sistema nervoso do demônio.' },
  4:{ nome:'☠️ Composto Akuma (C4)',    ing:{ sangueSuperior:2,sangueAkuma:1,lirioAzul:2,lirioVermelho:2 }, efeito:'Fragmenta o poder de Muzan. Efeito definitivo.' }
};
const LIRIO_NOMES = {
  lirioAzul:'🌀 Lírio Azul',lirioVermelho:'🌹 Lírio Vermelho',
  sangueLivre:'🩸 Sangue Livre',sangueSuperior:'💉 Sangue Superior',
  sangueInferior:'🔴 Sangue Inferior',sangueAkuma:'☠️ Sangue Akuma'
};
const INIMIGOS_PVE = {
  fraco: [
    { nome:'🦂 Demônio das Ruas', hp:8000, forca:3000, resistencia:3000, reflexo:2000 },
    { nome:'👺 Aranha Demoníaca', hp:7500, forca:2800, resistencia:2500, reflexo:2500 }
  ],
  medio: [
    { nome:'💀 Demônio da Lua Inferior', hp:22000, forca:8000, resistencia:7000, reflexo:6000 },
    { nome:'🌑 Araña do Sangue',         hp:24000, forca:9000, resistencia:8000, reflexo:7000 }
  ],
  dificil: [
    { nome:'🌘 Lua Superior Espúria',  hp:55000, forca:20000, resistencia:18000, reflexo:15000 },
    { nome:'👑 Emissário de Muzan',    hp:70000, forca:25000, resistencia:22000, reflexo:18000 }
  ]
};
const INIMIGOS_ONI = [
  { nome:'🗡️ Caçador Recruta',    hp:9000,  forca:3500,  resistencia:3000,  reflexo:3000  },
  { nome:'⚔️ Caçador Experiente', hp:18000, forca:8000,  resistencia:7000,  reflexo:7000  },
  { nome:'🏆 Pilar Hashira',      hp:55000, forca:25000, resistencia:22000, reflexo:20000 }
];
const AURA_FRASES = [
  'O ar ao redor de **{u}** condensa. Uma pressão avassaladora emana de seu corpo.',
  '**{u}** abre os olhos lentamente. A temperatura da sala cai de forma súbita.',
  'O chão treme levemente. **{u}** soltou sua pressão espiritual completamente.',
  'Uma aura sombria envolve **{u}**. Os mais fracos sentem um arrepio nos ossos.',
  '**{u}** respira fundo. O peso do seu poder é quase palpável no ar.'
];
const LIRIOS_LOCAIS = ['🌿 Floresta Densa','🏔️ Cume das Montanhas','🌊 Margem do Rio','🕌 Ruínas Antigas','🌾 Campo Aberto'];

const missaoAtiva = new Map();
const dueloAtivo  = new Map();
const comaAtivo   = new Map();
const bonecoAtivo = new Map();

function rollWeighted(lista) {
  const total = lista.reduce((s,i) => s+(i.peso||i.weight||1),0);
  let rand = Math.random()*total;
  for (const item of lista) { rand -= (item.peso||item.weight||1); if (rand<=0) return item; }
  return lista[lista.length-1];
}
function checkCooldown(player, key, horas) {
  const now = Date.now(), cd = (player.cooldowns&&player.cooldowns[key])||0;
  const diff = now-cd, needed = horas*3600000;
  if (diff<needed) {
    const mins = Math.ceil((needed-diff)/60000);
    const h = Math.floor(mins/60), m = mins%60;
    return h>0 ? `${h}h ${m}m` : `${m}m`;
  }
  return null;
}
function setCooldown(player, key) {
  if (!player.cooldowns) player.cooldowns={};
  player.cooldowns[key] = Date.now();
}
function savePlayer(id, player) { const d=loadPlayers(); d[id]=player; savePlayers(d); }
function isAdmin(member) { return member && member.permissions && member.permissions.has('Administrator'); }
function barra(atual, max, tam=10) {
  const f=Math.round(Math.min((atual/max),1)*tam);
  return '█'.repeat(Math.max(0,f))+'░'.repeat(Math.max(0,tam-f));
}
function getRollRaridade(item, campo='raridade') {
  const r = item[campo]||'';
  if (r.includes('MÍTICA')) return '#FF00FF';
  if (r.includes('LENDÁRIA')) return '#FFD700';
  if (r.includes('ÉPICA')) return '#9B59B6';
  if (r.includes('RARA')) return '#3498DB';
  if (r.includes('INCOMUM')) return '#2ECC71';
  return '#7F8C8D';
}

// ==========================================
// 📥 EVENTO DE MENSAGEM (SISTEMA DE COMANDOS)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🎴 COMMAND: c!status
    if (command === 'status') {
        const target = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(target.id);
        const player = getPlayer(target.id);
        const titles = loadTitles();

        const claDoCargo = pegarClaPorCargo(member);
        const respDoCargo = pegarRespiracaoPorCargo(member);
        if (claDoCargo && player.cla !== claDoCargo) player.cla = claDoCargo;
        if (respDoCargo !== 'nenhuma' && player.respiracao !== respDoCargo) player.respiracao = respDoCargo;

        const total = calcularTotal(player, member, titles);
        const nivelM = Math.min(Math.floor((player.maestria || 0) / 5000), 20);
        const vidaFinal = Math.floor(total.resistencia * 1.5 + (total.vida || 0));

        let infoRank = null; let rankNome = "Recruta";
        if (member) {
            member.roles.cache.forEach(role => {
                const nomeLimpo = normalizarNome(role.name);
                for (const [key, dados] of Object.entries(limitesRank)) {
                    if (normalizarNome(key) === nomeLimpo) {
                        if (!infoRank || dados.status > infoRank.status) { infoRank = dados; rankNome = role.name; }
                    }
                }
            });
        }
        const limBase = infoRank ? infoRank.status : 5000;

        const bF = total.forca - player.forca;
        const bR = total.resistencia - player.resistencia;
        const bV = total.velocidade - player.velocidade;
        const bX = total.reflexo - player.reflexo;

        const gomos = Math.floor(((player.maestria % 5000) / 5000) * 10);
        const barraHamon = "🏮 " + "⦿".repeat(gomos) + "⦾".repeat(10 - gomos) + " ✨";

        const embed = new EmbedBuilder()
            .setColor(member ? member.displayHexColor : '#2b2d31')
            .setTitle(`⛩️ ${rankNome.toUpperCase()}`)
            .setDescription(
                `*“${player.titulo || 'Um guerreiro forjado no aço e na determinação.'}”*\n\n` +
                `┏━━━━━━━ 🎴 **INFORMAÇÕES DE LINHAGEM** ━━━━━━━┓\n` +
                `┃ 💮 **Clã:** \`${player.cla || 'Nenhum'}\`\n` +
                `┃ 🌬️ **Respiração:** \`${player.respiracao.toUpperCase()}\`\n` +
                `┃ 🩸 **Kekkijutsu:** \`${player.kekkijutsu || 'Não possui'}\`\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            )
            .addFields([
                { 
                    name: '⚔️ STATUS DE COMBATE', 
                    value: 
                    `> 💥 **Força:** \`${total.forca.toLocaleString()}\` ┋ *(${player.forca.toLocaleString()} / ${limBase.toLocaleString()})* ┋ \`(+${bF.toLocaleString()} Buffs)\`\n> \n` +
                    `> 🛡️ **Defesa:** \`${total.resistencia.toLocaleString()}\` ┋ *(${player.resistencia.toLocaleString()} / ${limBase.toLocaleString()})* ┋ \`(+${bR.toLocaleString()} Buffs)\`\n> \n` +
                    `> 💨 **Rapidez:** \`${total.velocidade.toLocaleString()}\` ┋ *(${player.velocidade.toLocaleString()} / ${limBase.toLocaleString()})* ┋ \`(+${bV.toLocaleString()} Buffs)\`\n> \n` +
                    `> 👁️ **Reflexo:** \`${total.reflexo.toLocaleString()}\` ┋ *(${player.reflexo.toLocaleString()} / ${limBase.toLocaleString()})* ┋ \`(+${bX.toLocaleString()} Buffs)\``,
                    inline: false 
                },
                { 
                    name: '🏮 ENERGIA VITAL', 
                    value: `**HP Total:** \`${vidaFinal.toLocaleString()} HP\` ┋ **Fôlego:** \`${total.folego.toLocaleString()} un\`\n**Maestria:** \`Nível ${nivelM}/20\`\n${barraHamon}`, 
                    inline: false 
                }
            ]).setImage(player.imagem || null).setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    if (command === 'perfil') {
        const target = message.mentions.users.first() || message.author;
        let player = getPlayer(target.id);
        const member = message.guild.members.cache.get(target.id);

        const claDoCargo = pegarClaPorCargo(member);
        const respDoCargo = pegarRespiracaoPorCargo(member);
        if (claDoCargo && player.cla !== claDoCargo) player.cla = claDoCargo;
        if (respDoCargo !== 'nenhuma' && player.respiracao !== respDoCargo) player.respiracao = respDoCargo;

        const luckyTotal = pegarLuckyBoostAcumulativo(member);
        let marcaDisplay = '❌ \`Nenhuma\`'; let embedColor = member ? member.displayHexColor : '#2b2d31'; 
        if (player.marca === "Marca de Nascença") { marcaDisplay = '☀️ \`Nascença\`'; embedColor = '#FFD700'; }
        else if (player.marca === "Marca da Maldição") { marcaDisplay = '🩸 \`Maldição\`'; embedColor = '#8B0000'; }

        let rankExibicao = "Nenhum Rank"; let maiorPoderRank = -1;
        if (member) {
            member.roles.cache.forEach(role => {
                const nomeLimpoCargo = normalizarNome(role.name);
                for (const [rankNomeTabela, dados] of Object.entries(limitesRank)) {
                    if (normalizarNome(rankNomeTabela) === nomeLimpoCargo) {
                        if (dados.status > maiorPoderRank) { maiorPoderRank = dados.status; rankExibicao = role.name; }
                    }
                }
            });
        }

        const nivelM = Math.min(Math.floor((player.maestria || 0) / 5000), 20);
        const gomos = Math.floor(((player.maestria % 5000) / 5000) * 10);
        const barraHamon = "🏮 " + "⦿".repeat(gomos) + "⦾".repeat(10 - gomos) + " ✨";

        const rollsArray = Object.entries(player.rolls || {}).filter(([_, qtd]) => qtd > 0).map(([k, q]) => `\`${q}x\` **${NOMES_EXIBICAO[k] || k}**`);
        const rollsFinal = rollsArray.join(' ┋ ').slice(0, 1024);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`⛩️ PERFIL GERAL: ${rankExibicao.toUpperCase()}`)
            .setDescription(
                `*“${player.titulo || 'Escrevendo a própria lenda a cada balançar de espada.'}”*\n\n` +
                `┏━━━━━━━ 🎴 **IDENTIDADE E HISTÓRICO** ━━━━━━━┓\n` +
                `┃ 💮 **Linhagem:** \`${player.cla || 'Desconhecido'}\`\n` +
                `┃ 💀 **Abates:** \`${player.kills || 0}\` ┋ 💴 **Dinheiro:** \`${(player.ienes || 0).toLocaleString()}\`\n` +
                `┃ 🍀 **Fator de Sorte:** \`x${luckyTotal.toFixed(2)}\`\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            )
            .addFields([
                { name: '⚔️ DOMÍNIOS DE BATALHA E HERANÇAS', value: `> 🌬️ **Respiração:** \`${player.respiracao.toUpperCase()}\`\n> 🩸 **Arte Sanguínea:** \`${player.kekkijutsu || 'Não possui'}\`\n> ⚔️ **Lâmina Nichirin:** \`${player.nichirin || 'Não desperta'}\`\n> \n> 🧬 **Marca:** ${marcaDisplay}\n> 👁️ **Sentidos Apurados:** \`${player.sentido || 'Padrão'}\`\n> 🧪 **Tipo Sanguíneo:** \`${player.marechi ? '🩸 Marechi' : 'Comum'}\``, inline: false },
                { name: '🏮 NÍVEL DE CONCENTRAÇÃO', value: `**Maestria:** \`Nível ${nivelM}/20\` ┋ \`${player.maestria.toLocaleString()} XP\`\n${barraHamon}`, inline: false },
                { name: '🎒 INVENTÁRIO (BENS E ROLLS)', value: rollsFinal || '*A bagagem está vazia.*', inline: false }
            ]).setImage(player.imagem || null);

        return message.reply({ embeds: [embed] });
    }

    if (command === 'dano') {
        const player = getPlayer(message.author.id);
        const member = message.member;
        const cacheTitles = loadTitles();
        const buscaNome = args.join(' ').toLowerCase();
        if (!buscaNome) return message.reply("❌ Digite o nome da técnica.");

        let infoGolpe = null; let categoriaEncontrada = null;
        const normalizar = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const todasCategorias = { ...formasDados, ...kekkiDados };
        for (const [cat, lista] of Object.entries(todasCategorias)) {
            const achou = lista.find(f => normalizar(f.nome).includes(normalizar(buscaNome)));
            if (achou) { infoGolpe = achou; categoriaEncontrada = cat; break; }
        }

        if (!infoGolpe) return message.reply("❌ Técnica não encontrada.");

        const totalStats = calcularTotal(player, member, cacheTitles);
        const danoNoHP = Math.floor((totalStats.forca + (infoGolpe.forca || 0)) / 5);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`⛩️ ANÁLISE DE IMPACTO: ${infoGolpe.nome.toUpperCase()}`)
            .addFields([
                { name: '⚔️ VETORES DE COMBATE', value: `╰(💥) **Força Bruta:** \`${(totalStats.forca + (infoGolpe.forca || 0)).toLocaleString()} kg\``, inline: false },
                { name: '🎯 CONVERSÃO EM DANO LETAL', value: `## \` ${danoNoHP.toLocaleString()} HP \``, inline: false }
            ]);

        return message.reply({ embeds: [embed] });
    }

    if (command === 'formas') {
        const member = message.member;
        const player = getPlayer(message.author.id);
        const estiloAtivo = pegarRespiracaoPorCargo(member);

        if (estiloAtivo === 'nenhuma') return message.reply("❌ Não possuis estilo de respiração ativo.");

        const formas = formasDados[estiloAtivo];
        if (!formas) return message.reply("⚠️ Pergaminho não encontrado.");

        const embedInicial = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`⛩️ GRIMÓRIO DE TÉCNICAS: ${estiloAtivo.toUpperCase()}`)
            .setDescription("Desenrole o pergaminho abaixo para mapear as suas formas de combate.");

        const menu = new StringSelectMenuBuilder()
            .setCustomId('select_forma')
            .setPlaceholder('Escolha a forma para ler...')
            .addOptions(formas.map((f, i) => new StringSelectMenuOptionBuilder().setLabel(f.nome).setValue(`forma_${i}`).setEmoji('⚔️')));

        const row = new ActionRowBuilder().addComponents(menu);
        return message.reply({ embeds: [embedInicial], components: [row] });
    }

    // ==========================================
    // 🩸 COMMAND: c!tecnicas
    // ==========================================
    if (command === 'tecnicas') {
        const player = getPlayer(message.author.id);
        if (!player.kekkijutsu) return message.reply('❌ Você não possui um Kekkijutsu registrado.');
        const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        let listaEncontrada = null;
        for (const [key, lista] of Object.entries(kekkiDados)) {
            if (normalizar(player.kekkijutsu).includes(normalizar(key))) { listaEncontrada = lista; break; }
        }
        if (!listaEncontrada) return message.reply('⚠️ Grimório de Kekkijutsu não encontrado para `'+player.kekkijutsu+'`.');
        const embed = new EmbedBuilder().setColor('#8B0000').setTitle(`🩸 GRIMÓRIO KEKKIJUTSU: ${player.kekkijutsu.toUpperCase()}`).setDescription('Selecione a técnica para ver os detalhes sombrios.');
        const menu = new StringSelectMenuBuilder().setCustomId('select_kekki').setPlaceholder('Escolha a técnica...').addOptions(
            listaEncontrada.slice(0,25).map((t,i) => new StringSelectMenuOptionBuilder().setLabel(t.nome.slice(0,100)).setValue(`kekki_${i}`).setEmoji('🩸'))
        );
        return message.reply({ embeds:[embed], components:[new ActionRowBuilder().addComponents(menu)] });
    }

    // ==========================================
    // 🎴 COMMAND: c!start-h / c!start-o
    // ==========================================
    if (command === 'start-h' || command === 'start-o') {
        const raca = command === 'start-h' ? 'humano' : 'oni';
        const data = loadPlayers();
        if (data[message.author.id] && data[message.author.id].iniciou) return message.reply('❌ Você já iniciou sua jornada!');
        const player = getPlayer(message.author.id);
        player.raca = raca;
        player.iniciou = true;
        player.ienes = 500;
        player.kcoins = 0;
        savePlayer(message.author.id, player);
        const cor = raca === 'humano' ? '#4169E1' : '#8B0000';
        const emoji = raca === 'humano' ? '⚔️' : '👺';
        const embed = new EmbedBuilder().setColor(cor)
            .setTitle(`${emoji} BEM-VINDO À ERA TAISHO!`)
            .setDescription(
                `┏━━━━━━━ 🎴 **SUA JORNADA COMEÇA** ━━━━━━━┓\n`+
                `┃ 🏷️ **Raça:** \`${raca === 'humano' ? 'Caçador de Demônios' : 'Oni — Sangue de Muzan'}\`\n`+
                `┃ 💴 **Ienes iniciais:** \`500\`\n`+
                `┃ 🎯 **Próximo passo:** Use \`c!cla-${raca==='humano'?'h':'o'}\` para rolar seu Clã!\n`+
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🎴 COMMAND: c!cla-h / c!cla-o
    // ==========================================
    if (command === 'cla-h' || command === 'cla-o') {
        const raca = command === 'cla-h' ? 'humano' : 'oni';
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'roll_cla', 24);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para rolar novamente.`);
        const tabela = raca === 'humano' ? CLAS_HUMANOS_ROLL : CLAS_ONIS_ROLL;
        const boost = pegarLuckyBoostAcumulativo(message.member);
        const idx = Math.floor(Math.random() * tabela.length * (1/boost));
        const resultado = tabela[Math.max(0, Math.min(idx, tabela.length-1))];
        const cla = resultado.nome;
        const statsBase = CLAS[cla] || {};
        player.cla = cla;
        player.forca = Math.floor((statsBase.forca||0) * 0.1);
        player.resistencia = Math.floor((statsBase.resistencia||0) * 0.1);
        player.velocidade = Math.floor((statsBase.velocidade||0) * 0.1);
        player.reflexo = Math.floor((statsBase.reflexo||0) * 0.1);
        player.folego = Math.floor((statsBase.folego||0) * 0.05);
        setCooldown(player, 'roll_cla');
        savePlayer(message.author.id, player);
        const total = (statsBase.forca||0)+(statsBase.resistencia||0)+(statsBase.velocidade||0)+(statsBase.reflexo||0);
        const raridade = total > 10000 ? '🌟 LENDÁRIO' : total > 7000 ? '🔮 ÉPICO' : total > 5000 ? '💎 RARO' : total > 3000 ? '🔹 INCOMUM' : '⬜ COMUM';
        const cor = total>10000?'#FFD700':total>7000?'#9B59B6':total>5000?'#3498DB':total>3000?'#2ECC71':'#7F8C8D';
        const embed = new EmbedBuilder().setColor(cor)
            .setTitle(`🎴 ROLETA DE CLÃ — ${raridade}`)
            .setDescription(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 💮 **Clã:** \`${CLAS_DISPLAY[cla]||cla}\`\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`)
            .addFields([
                { name:'⚡ ATRIBUTOS BASE DO CLÃ', value:`> 💥 Força: \`${statsBase.forca||0}\`\n> 🛡️ Resistência: \`${statsBase.resistencia||0}\`\n> 💨 Velocidade: \`${statsBase.velocidade||0}\`\n> 👁️ Reflexo: \`${statsBase.reflexo||0}\`\n> 🏮 Fôlego: \`${statsBase.folego||0}\``, inline:false }
            ]).setFooter({ text:'Cooldown de 24h • Use c!status para ver seus atributos' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!roll-nichirin
    // ==========================================
    if (command === 'roll-nichirin') {
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'roll_nichirin', 48);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para reforjar sua lâmina.`);
        if (!player.rolls || !player.rolls['Roll-Nichirin'] || player.rolls['Roll-Nichirin'] < 1)
            return message.reply('❌ Você não tem nenhum **Roll-Nichirin** no inventário. Compre em `c!lojavip`.');
        const resultado = rollWeighted(NICHIRIN_CORES);
        player.nichirin = resultado.cor;
        player.rolls['Roll-Nichirin']--;
        setCooldown(player, 'roll_nichirin');
        savePlayer(message.author.id, player);
        const cor = getRollRaridade(resultado);
        const embed = new EmbedBuilder().setColor(cor)
            .setTitle('⚔️ FORJA DA LÂMINA NICHIRIN')
            .setDescription(
                `*A espada bebeu do minério e revelou sua verdadeira cor...*\n\n`+
                `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`+
                `┃ ${resultado.emoji} **Lâmina:** \`${resultado.cor}\`\n`+
                `┃ ✨ **Raridade:** ${resultado.raridade}\n`+
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⭐ COMMAND: c!prodigio
    // ==========================================
    if (command === 'prodigio') {
        const player = getPlayer(message.author.id);
        if (!player.rolls || !player.rolls['Prodigio'] || player.rolls['Prodigio'] < 1)
            return message.reply('❌ Você não tem nenhum **Roll-Prodígio** no inventário.');
        const cd = checkCooldown(player, 'roll_prodigio', 72);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para tentar novamente.`);
        const chance = Math.random();
        const boost = pegarLuckyBoostAcumulativo(message.member);
        const sucesso = chance < (0.15 * boost);
        player.rolls['Prodigio']--;
        setCooldown(player, 'roll_prodigio');
        if (sucesso) player.prodigio = true;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder()
            .setColor(sucesso ? '#FFD700' : '#2b2d31')
            .setTitle(sucesso ? '⭐ GENÉTICA DE PRODÍGIO DESPERTADA!' : '💀 A Genética Permanece Adormecida')
            .setDescription(sucesso
                ? `*O sangue antigo fluiu. Uma herança esquecida acordou em você.*\n\n✅ Você é um **Prodígio** — seus limites de status são expandidos!`
                : `*A tentativa falhou. O sangue não respondeu desta vez.*\n\n❌ Tente novamente quando os astros estiverem alinhados.`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ☀️🩸 COMMAND: c!marca-nascenca / c!marca-maldicao
    // ==========================================
    if (command === 'marca-nascenca' || command === 'marca-maldicao') {
        const player = getPlayer(message.author.id);
        const tipo = command === 'marca-nascenca' ? 'marca-nascença' : 'marca-maldiçao';
        if (!player.rolls || !player.rolls[tipo] || player.rolls[tipo] < 1)
            return message.reply(`❌ Você não tem nenhum **Roll-${NOMES_EXIBICAO[tipo]||tipo}** no inventário.`);
        const cd = checkCooldown(player, `roll_${command}`, 48);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para tentar despertar a marca.`);
        const boost = pegarLuckyBoostAcumulativo(message.member);
        const sucesso = Math.random() < (0.20 * boost);
        player.rolls[tipo]--;
        setCooldown(player, `roll_${command}`);
        if (sucesso) player.marca = command === 'marca-nascenca' ? 'Marca de Nascença' : 'Marca da Maldição';
        savePlayer(message.author.id, player);
        const isNasc = command === 'marca-nascenca';
        const embed = new EmbedBuilder()
            .setColor(sucesso ? (isNasc?'#FFD700':'#8B0000') : '#2b2d31')
            .setTitle(sucesso
                ? (isNasc ? '☀️ MARCA DE NASCENÇA DESPERTADA!' : '🩸 MARCA DA MALDIÇÃO DESPERTADA!')
                : '❌ A Marca Não Respondeu')
            .setDescription(sucesso
                ? `*${isNasc ? 'Uma luz solar queimou na pele. A marca ancestral floresceu.' : 'Uma dor lancinante. O sangue de Muzan marcou seu corpo para sempre.'}`
                : `*O corpo não respondeu. A marca permanece adormecida.* Tente novamente!`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ✨ COMMAND: c!quebra-maldicao
    // ==========================================
    if (command === 'quebra-maldicao') {
        const player = getPlayer(message.author.id);
        if (player.raca !== 'oni') return message.reply('❌ Apenas Onis podem tentar quebrar a maldição de Muzan.');
        if (!player.rolls || !player.rolls['Quebra-Maldição'] || player.rolls['Quebra-Maldição'] < 1)
            return message.reply('❌ Você não tem nenhum **Roll-Quebra-Maldição** no inventário.');
        const cd = checkCooldown(player, 'roll_quebra', 72);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para tentar se libertar novamente.`);
        const boost = pegarLuckyBoostAcumulativo(message.member);
        const sucesso = Math.random() < (0.12 * boost);
        player.rolls['Quebra-Maldição']--;
        setCooldown(player, 'roll_quebra');
        if (sucesso) player.oniLivre = true;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder()
            .setColor(sucesso ? '#9B59B6' : '#2b2d31')
            .setTitle(sucesso ? '✨ MALDIÇÃO QUEBRADA — VOCÊ É LIVRE!' : '⛓️ A Maldição Prevaleceu')
            .setDescription(sucesso
                ? `*A corrente de Muzan se partiu. Você sentiu o controle esvanecer. Você é um **Oni Livre** agora!*`
                : `*A maldição é forte demais. Muzan mantém o controle por mais um tempo.*`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🧪 COMMAND: c!marechi
    // ==========================================
    if (command === 'marechi') {
        const player = getPlayer(message.author.id);
        if (!player.rolls || !player.rolls['Marechi'] || player.rolls['Marechi'] < 1)
            return message.reply('❌ Você não tem nenhum **Roll-Marechi** no inventário.');
        const cd = checkCooldown(player, 'roll_marechi', 48);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para testar seu sangue novamente.`);
        const boost = pegarLuckyBoostAcumulativo(message.member);
        const sucesso = Math.random() < (0.18 * boost);
        player.rolls['Marechi']--;
        setCooldown(player, 'roll_marechi');
        if (sucesso) player.marechi = true;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder()
            .setColor(sucesso ? '#E91E8C' : '#2b2d31')
            .setTitle(sucesso ? '🧪 SANGUE MARECHI DETECTADO!' : '🔬 Sangue Comum')
            .setDescription(sucesso
                ? `*Seu sangue emana um aroma irresistível. Qualidade rara que atrai os demônios mais poderosos.*\n\n✅ Você possui **Sangue Marechi** — buffs de sorte e raridade aumentados!`
                : `*Seu sangue é comum. Os demônios pouco se importariam com ele.*`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 👁️ COMMAND: c!sentidos / c!roll-sentidos
    // ==========================================
    if (command === 'sentidos' || command === 'roll-sentidos') {
        const player = getPlayer(message.author.id);
        if (!player.rolls || !player.rolls['Sentidos'] || player.rolls['Sentidos'] < 1)
            return message.reply('❌ Você não tem nenhum **Roll-Sentidos** no inventário.');
        const cd = checkCooldown(player, 'roll_sentidos', 48);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para tentar despertar novamente.`);
        const resultado = rollWeighted(SENTIDOS_LISTA);
        const boost = pegarLuckyBoostAcumulativo(message.member);
        player.rolls['Sentidos']--;
        setCooldown(player, 'roll_sentidos');
        player.sentido = resultado.nome;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#1ABC9C')
            .setTitle(`${resultado.emoji} MUTAÇÃO BIOLÓGICA ATIVADA`)
            .setDescription(
                `*Algo mudou em você. Seus sentidos ultrapassaram o limite humano.*\n\n`+
                `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`+
                `┃ ${resultado.emoji} **Sentido:** \`${resultado.nome}\`\n`+
                `┃ 📖 **Efeito:** *${resultado.descricao}*\n`+
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🎲 COMMAND: c!rolltreino
    // ==========================================
    if (command === 'rolltreino') {
        const tipo = args[0]?.toLowerCase();
        if (!tipo || !['adaptacao','dominio'].includes(tipo))
            return message.reply('❌ Use: `c!rolltreino adaptacao` ou `c!rolltreino dominio`');
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, `rolltreino_${tipo}`, 12);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para rolar novamente.`);
        const dado = Math.floor(Math.random()*20)+1;
        const sucesso = tipo==='adaptacao' ? dado >= 10 : dado >= 15;
        setCooldown(player, `rolltreino_${tipo}`);
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder()
            .setColor(sucesso ? '#2ECC71' : '#E74C3C')
            .setTitle(`🎲 DADO DE TREINO — ${tipo.toUpperCase()}`)
            .addFields([
                { name:'🎯 Resultado do Dado', value:`## \`🎲 ${dado}/20\``, inline:true },
                { name:'📊 Limite', value:`\`≥ ${tipo==='adaptacao'?10:15} para sucesso\``, inline:true },
                { name:'🏆 Resultado', value:sucesso?'✅ **SUCESSO** — Você pode aprender!':'❌ **FALHA** — Continue treinando!', inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🌅 COMMAND: c!rollfinal
    // ==========================================
    if (command === 'rollfinal') {
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'rollfinal', 168);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para tentar o Roll Final.`);
        const dado = Math.floor(Math.random()*20)+1;
        const sucesso = dado >= 18;
        setCooldown(player, 'rollfinal');
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder()
            .setColor(sucesso ? '#FFD700' : '#8B0000')
            .setTitle('🌅 ROLL FINAL — 13ª FORMA / RESPIRAÇÃO DO SOL')
            .setDescription(sucesso
                ? `*O dado caiu. O destino sorriu. A forma suprema se revelou.*`
                : `*O dado foi cruel. O limite ainda não foi alcançado.*`
            ).addFields([
                { name:'🎲 Dado Rolado', value:`## \`🎲 ${dado}/20\``, inline:true },
                { name:'🏆 Resultado', value:sucesso?'✅ **APROVADO** — A 13ª Forma é sua!':'❌ **REPROVADO** — Cooldown de 7 dias.', inline:true }
            ]).setFooter({ text:'Apenas os escolhidos dominam a forma suprema' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 📊 COMMAND: c!cargos
    // ==========================================
    if (command === 'cargos') {
        const member = message.member;
        let linhas = [];
        if (!member) return message.reply('❌ Não foi possível verificar seus cargos.');
        member.roles.cache.forEach(role => {
            const nomeLimpo = normalizarNome(role.name);
            for (const [key, b] of Object.entries({...roleBuffs,...habilidadesRoles})) {
                if (normalizarNome(key)===nomeLimpo) {
                    const vals = Object.entries(b).filter(([k,v])=>v>0).map(([k,v])=>`${k}: +${v.toLocaleString()}`).join(' ┋ ');
                    if (vals) linhas.push(`> 🎴 **${role.name}**\n> ${vals}`);
                }
            }
        });
        const embed = new EmbedBuilder().setColor(member.displayHexColor||'#2b2d31')
            .setTitle('📊 BÔNUS DOS SEUS CARGOS')
            .setDescription(linhas.length ? linhas.join('\n\n') : '*Nenhum cargo com bônus detectado.*')
            .setFooter({ text:'c!status para ver o total final' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🖼️ COMMAND: c!setimagem
    // ==========================================
    if (command === 'setimagem') {
        const player = getPlayer(message.author.id);
        let url = args[0] || null;
        if (!url && message.attachments.size > 0) url = message.attachments.first().url;
        if (!url) return message.reply('❌ Forneça um link ou anexe uma imagem.\nUso: `c!setimagem <link>`');
        player.imagem = url;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#2ECC71').setTitle('🖼️ IMAGEM ATUALIZADA')
            .setDescription('✅ Sua imagem de perfil foi atualizada com sucesso!').setImage(url).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🏋️ COMMAND: c!treinar
    // ==========================================
    if (command === 'treinar') {
        const stat = args[0]?.toLowerCase();
        const statsValidos = ['forca','resistencia','velocidade','reflexo','folego'];
        if (!stat || !statsValidos.includes(stat))
            return message.reply(`❌ Use: \`c!treinar <${statsValidos.join('/')}>\``);
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, `treinar_${stat}`, 8);
        if (cd && !player.rolls?.['Skip-Treino']) return message.reply(`⏳ **${stat.toUpperCase()}** em recuperação. Aguarde **${cd}**.`);
        if (cd && player.rolls['Skip-Treino'] > 0) { player.rolls['Skip-Treino']--; }
        const member = message.member;
        let infoRank = null;
        if (member) {
            member.roles.cache.forEach(role => {
                const nomeLimpo = normalizarNome(role.name);
                for (const [key, dados] of Object.entries(limitesRank)) {
                    if (normalizarNome(key)===nomeLimpo) { if (!infoRank || dados.status>infoRank.status) infoRank=dados; }
                }
            });
        }
        const limite = infoRank ? infoRank.status : 5000;
        const atual = Number(player[stat])||0;
        if (atual >= limite && stat !== 'folego') return message.reply(`❌ Você atingiu o limite do seu rank (\`${limite.toLocaleString()}\`) em **${stat}**! Evolua de rank para continuar.`);
        const dado = Math.floor(Math.random()*4)+1;
        const ganho = Math.floor(limite * 0.04 * dado * (0.9 + Math.random()*0.2));
        const ganhoFinal = stat==='folego' ? ganho*3 : Math.min(ganho, limite-atual);
        player[stat] = atual + ganhoFinal;
        setCooldown(player, `treinar_${stat}`);
        savePlayer(message.author.id, player);
        const emojis = {forca:'💥',resistencia:'🛡️',velocidade:'💨',reflexo:'👁️',folego:'🏮'};
        const embed = new EmbedBuilder().setColor('#E74C3C')
            .setTitle(`🏋️ TREINO INTENSO — ${stat.toUpperCase()}`)
            .addFields([
                { name:'📈 Ganho', value:`${emojis[stat]||'⚡'} **+${ganhoFinal.toLocaleString()}** em ${stat}`, inline:true },
                { name:'📊 Total Atual', value:`\`${player[stat].toLocaleString()} / ${stat==='folego'?'∞':limite.toLocaleString()}\``, inline:true },
                { name:'⏳ Cooldown', value:'`8 horas`', inline:true }
            ]).setFooter({ text:'Próximo treino em 8 horas • Use c!status para ver o total com buffs' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🌬️ COMMAND: c!treinarmaestria
    // ==========================================
    if (command === 'treinarmaestria') {
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'treinar_maestria', 8);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para praticar novamente.`);
        const ganho = Math.floor(Math.random()*1000)+500;
        player.maestria = (Number(player.maestria)||0) + ganho;
        setCooldown(player, 'treinar_maestria');
        savePlayer(message.author.id, player);
        const nivelAtual = Math.min(Math.floor(player.maestria/5000),20);
        const gomos = Math.floor(((player.maestria%5000)/5000)*10);
        const barraH = '🏮 '+'⦿'.repeat(gomos)+'⦾'.repeat(10-gomos)+' ✨';
        const embed = new EmbedBuilder().setColor('#9B59B6')
            .setTitle('🌬️ TREINO DE MAESTRIA')
            .addFields([
                { name:'✨ XP de Maestria Ganho', value:`**+${ganho.toLocaleString()} XP**`, inline:true },
                { name:'🎯 Nível Atual', value:`\`Nível ${nivelAtual}/20\``, inline:true },
                { name:'📊 Progresso', value:barraH, inline:false }
            ]).setFooter({ text:'Cooldown de 8h • Maestria max: Nível 20 (100.000 XP)' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 👁️ COMMAND: c!treinarsentido
    // ==========================================
    if (command === 'treinarsentido') {
        const sentidoArg = args.join(' ').toLowerCase();
        const mapa = { visao:'visao', olfato:'olfato', audicao:'audicao', tato:'tato', paladar:'paladar' };
        const key = Object.keys(mapa).find(k => sentidoArg.includes(k));
        if (!key) return message.reply('❌ Use: `c!treinarsentido <visao/olfato/audicao/tato/paladar>`');
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, `sentido_${key}`, 10);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para treinar este sentido novamente.`);
        if (!player.sentidos) player.sentidos = { visao:0, olfato:0, audicao:0, tato:0, paladar:0 };
        const ganho = Math.floor(Math.random()*15)+5;
        player.sentidos[key] = Math.min((player.sentidos[key]||0)+ganho, 100);
        setCooldown(player, `sentido_${key}`);
        savePlayer(message.author.id, player);
        const nivel = player.sentidos[key];
        const qualidade = nivel>=90?'🌟 Excelente':nivel>=70?'💎 Avançado':nivel>=50?'🔹 Bom':nivel>=30?'⬜ Médio':'💤 Básico';
        const embed = new EmbedBuilder().setColor('#1ABC9C')
            .setTitle(`👁️ TREINO DE SENTIDO — ${key.toUpperCase()}`)
            .addFields([
                { name:'📈 Melhora', value:`+${ganho}% de eficiência`, inline:true },
                { name:'📊 Nível Atual', value:`\`${nivel}/100\` — ${qualidade}`, inline:true },
                { name:'Progresso', value:`\`${barra(nivel,100,15)}\` ${nivel}%`, inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 👁️ COMMAND: c!ver-sentidos
    // ==========================================
    if (command === 'ver-sentidos') {
        const player = getPlayer(message.author.id);
        const s = player.sentidos||{ visao:0,olfato:0,audicao:0,tato:0,paladar:0 };
        const fmt = (n,v) => {
            const q = v>=90?'Excelente':v>=70?'Avançado':v>=50?'Bom':v>=30?'Médio':'Básico';
            return `> ${n}: \`${v}/100\` — ${q}\n> \`${barra(v,100,12)}\``;
        };
        const embed = new EmbedBuilder().setColor('#1ABC9C')
            .setTitle('👁️ PAINEL DE SENTIDOS')
            .setDescription(`**Sentido Especial:** \`${player.sentido||'Nenhum despertado'}\`\n\n`+
                fmt('👁️ Visão',s.visao)+'\n\n'+fmt('👃 Olfato',s.olfato)+'\n\n'+
                fmt('👂 Audição',s.audicao)+'\n\n'+fmt('🤲 Tato',s.tato)+'\n\n'+fmt('👅 Paladar',s.paladar)
            ).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🍖 COMMAND: c!alimentar (Oni)
    // ==========================================
    if (command === 'alimentar') {
        const player = getPlayer(message.author.id);
        if (player.raca !== 'oni') return message.reply('❌ Apenas Onis podem se alimentar de sangue.');
        const cd = checkCooldown(player, 'alimentar', 4);
        if (cd && !player.rolls?.['Skip-Alimentacao']) return message.reply(`⏳ Você acabou de se banquetear. Aguarde **${cd}**.`);
        if (cd && player.rolls['Skip-Alimentacao']>0) player.rolls['Skip-Alimentacao']--;
        const ganho = Math.floor(Math.random()*3000)+1000;
        const stats = ['forca','resistencia','velocidade','reflexo'];
        const statEsc = stats[Math.floor(Math.random()*stats.length)];
        player[statEsc] = (Number(player[statEsc])||0) + ganho;
        player.medicina = player.medicina||{};
        player.medicina.sangueInferior = (player.medicina.sangueInferior||0)+1;
        setCooldown(player, 'alimentar');
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#8B0000')
            .setTitle('🩸 BANQUETE DE SANGUE')
            .setDescription(`*O sangue fluiu. Você sentiu seu corpo fortalecer...*`)
            .addFields([
                { name:'⬆️ Atributo Fortalecido', value:`**${statEsc.toUpperCase()}** +${ganho.toLocaleString()}`, inline:true },
                { name:'🧪 Coletado', value:'`+1 Sangue Inferior`', inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💤 COMMAND: c!dormir (Oni)
    // ==========================================
    if (command === 'dormir') {
        const dias = parseInt(args[0]);
        if (![1,3,5].includes(dias)) return message.reply('❌ Use: `c!dormir <1/3/5>` (dias de coma)');
        const player = getPlayer(message.author.id);
        if (player.raca !== 'oni') return message.reply('❌ Apenas Onis entram em coma regenerativo.');
        if (comaAtivo.has(message.author.id)) return message.reply('❌ Você já está em coma!');
        const acordar = Date.now() + dias*86400000;
        player.coma = { inicio: Date.now(), fim: acordar, dias };
        comaAtivo.set(message.author.id, acordar);
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#2C3E50')
            .setTitle('💤 ENTRANDO EM COMA REGENERATIVO')
            .setDescription(`*Suas células começam a se multiplicar. O coma consumirá ${dias} dia${dias>1?'s':''}...*\n\n⚠️ **Aviso:** Acordar antes do tempo pode causar danos permanentes!\nUse \`c!acordar\` apenas quando estiver pronto.`)
            .addFields([{ name:'⏰ Acordar em', value:`\`${new Date(acordar).toLocaleString('pt-BR')}\``, inline:false }])
            .setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ☀️ COMMAND: c!acordar
    // ==========================================
    if (command === 'acordar') {
        const player = getPlayer(message.author.id);
        if (!player.coma) return message.reply('❌ Você não está em coma.');
        const agora = Date.now();
        const fim = player.coma.fim;
        const completo = agora >= fim;
        const ganhoBase = player.coma.dias * 5000;
        let ganho = completo ? ganhoBase : Math.floor(ganhoBase * 0.3);
        let msg = '';
        if (completo) {
            const stats = ['forca','resistencia','velocidade','reflexo'];
            stats.forEach(s => { player[s] = (Number(player[s])||0) + Math.floor(ganho/4); });
            player.kills = (player.kills||0) + player.coma.dias;
            msg = `✅ **Coma completo!** Você acordou renovado.\n+${ganho.toLocaleString()} distribuído nos atributos!`;
        } else {
            const chance = Math.random();
            if (chance < 0.4) {
                player.forca = Math.max(0, (player.forca||0)-2000);
                player.resistencia = Math.max(0, (player.resistencia||0)-2000);
                msg = `⚠️ **Acordou cedo!** Seu corpo rejeitou a regeneração forçada.\n**-2.000 Força e -2.000 Resistência!**`;
            } else {
                msg = `⚠️ **Acordou cedo!** Escapou por sorte — sem bônus desta vez.`;
            }
        }
        delete player.coma;
        comaAtivo.delete(message.author.id);
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor(completo?'#2ECC71':'#E74C3C')
            .setTitle(completo?'☀️ ACORDOU — REGENERAÇÃO COMPLETA':'⚠️ ACORDOU ANTES DA HORA')
            .setDescription(msg).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🧬 COMMAND: c!regen / c!curar
    // ==========================================
    if (command === 'regen' || command === 'curar') {
        const embed = new EmbedBuilder().setColor('#27AE60')
            .setTitle('🧬 TABELA DE REGENERAÇÃO BIOLÓGICA')
            .setDescription('Sistema de cura automática por turno para Onis e Híbridos.')
            .addFields([
                { name:'🩸 Turno 1-3', value:'Regenera `15%` do HP máximo por turno', inline:false },
                { name:'🩸 Turno 4-6', value:'Regenera `10%` do HP máximo por turno', inline:false },
                { name:'🩸 Turno 7-10', value:'Regenera `5%` do HP máximo por turno', inline:false },
                { name:'⚠️ Turno 11+', value:'Regeneração interrompida — limite biológico atingido', inline:false },
                { name:'☠️ Decapitação', value:'`-80%` de HP — risco de morte permanente', inline:false },
                { name:'☀️ Luz Solar', value:'Sem regeneração — dano contínuo de `5%` por turno', inline:false }
            ]).setFooter({ text:'Regeneração válida apenas para Onis e Híbridos confirmados pela Staff' });
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⬆️ COMMAND: c!evoluir
    // ==========================================
    if (command === 'evoluir') {
        const player = getPlayer(message.author.id);
        if (player.raca !== 'oni' || !player.oniLivre) return message.reply('❌ Apenas **Onis Livres** podem evoluir sozinhos.');
        const kills = player.kills||0;
        const diasComa = player.diasComa||0;
        let evolucao = null;
        if (kills>=200 && diasComa>=30) evolucao = { rank:'👑 Rei Oni', cor:'#FFD700', bonus:20000 };
        else if (kills>=100 && diasComa>=15) evolucao = { rank:'🌕 Lua Superior 1', cor:'#FFD700', bonus:12000 };
        else if (kills>=60 && diasComa>=10) evolucao = { rank:'🌔 Lua Superior 2', cor:'#FFA500', bonus:8000 };
        else if (kills>=30) evolucao = { rank:'🌖 Lua Superior 3', cor:'#9B59B6', bonus:5000 };
        else return message.reply(`❌ Não atingiu os requisitos para evoluir.\n> Kills: \`${kills}\` ┋ Dias de Coma: \`${diasComa}\``);
        ['forca','resistencia','velocidade','reflexo'].forEach(s => { player[s]=(Number(player[s])||0)+Math.floor(evolucao.bonus/4); });
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor(evolucao.cor)
            .setTitle(`⬆️ EVOLUÇÃO CONFIRMADA — ${evolucao.rank}`)
            .setDescription(`*Seus olhos ficaram mais afiados. Seu poder transbordou.*\n\n✅ Agora você é um **${evolucao.rank}**!\nPeça à Staff para atualizar seu cargo no servidor.`)
            .addFields([{ name:'⬆️ Bônus de Evolução', value:`+${evolucao.bonus.toLocaleString()} distribuído nos atributos`, inline:false }])
            .setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!reagir
    // ==========================================
    if (command === 'reagir') {
        const nomeGolpe = args.slice(0,-1).join(' ');
        const forcaInimigo = parseInt(args[args.length-1]);
        if (!nomeGolpe || isNaN(forcaInimigo)) return message.reply('❌ Use: `c!reagir <nome do golpe> <força do inimigo>`');
        const player = getPlayer(message.author.id);
        const titles = loadTitles();
        const total = calcularTotal(player, message.member, titles);
        const dado = Math.floor(Math.random()*20)+1;
        const forcaReacao = total.reflexo + (dado*500);
        const sucesso = forcaReacao > forcaInimigo;
        const margem = Math.abs(forcaReacao - forcaInimigo);
        let resultado = sucesso
            ? dado>=18 ? '✨ **ESQUIVA PERFEITA** — Desviou com maestria absoluta!' : '✅ **DEFESA/ESQUIVA** — Conseguiu reagir a tempo!'
            : dado<=3 ? '💀 **FALHA CRÍTICA** — Tomou dano e ainda caiu!' : '❌ **TOMOU O GOLPE** — Não foi rápido o suficiente.';
        const embed = new EmbedBuilder().setColor(sucesso?'#2ECC71':'#E74C3C')
            .setTitle(`⚔️ REAÇÃO: ${nomeGolpe.toUpperCase()}`)
            .addFields([
                { name:'🎲 Dado Rolado', value:`\`🎲 ${dado}/20\``, inline:true },
                { name:'👁️ Reflexo + Dado', value:`\`${forcaReacao.toLocaleString()}\``, inline:true },
                { name:'💥 Força do Inimigo', value:`\`${forcaInimigo.toLocaleString()}\``, inline:true },
                { name:'📊 Margem', value:`\`${margem.toLocaleString()}\` pts`, inline:true },
                { name:'🏆 Resultado', value:resultado, inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!iniciarmissao
    // ==========================================
    if (command === 'iniciarmissao') {
        const raca = args[0]?.toLowerCase();
        const dificuldade = args[1]?.toLowerCase();
        if (!raca||!dificuldade||!['cacador','oni'].includes(raca)||!['fraco','medio','dificil'].includes(dificuldade))
            return message.reply('❌ Use: `c!iniciarmissao <cacador/oni> <fraco/medio/dificil> [@membros]`');
        if (missaoAtiva.has(message.author.id)) return message.reply('❌ Você já está em uma missão. Use `c!cancelarmissao` primeiro.');
        const party = [message.author.id, ...message.mentions.users.map(u=>u.id)].slice(0,3);
        const lista = raca==='cacador' ? INIMIGOS_PVE[dificuldade] : INIMIGOS_ONI;
        const inimigo = lista[Math.floor(Math.random()*lista.length)];
        const missao = { inimigo:{ ...inimigo }, raca, dificuldade, party, turno:1, hpAtual:inimigo.hp };
        party.forEach(id => missaoAtiva.set(id, missao));
        const embed = new EmbedBuilder().setColor('#E74C3C')
            .setTitle('⚔️ MISSÃO INICIADA!')
            .setDescription(`*O inimigo apareceu. Preparem-se para o combate!*`)
            .addFields([
                { name:'👹 Inimigo', value:inimigo.nome, inline:true },
                { name:'💪 Nível', value:dificuldade.toUpperCase(), inline:true },
                { name:'❤️ HP do Inimigo', value:`\`${inimigo.hp.toLocaleString()}\``, inline:true },
                { name:'💥 Força', value:`\`${inimigo.forca.toLocaleString()}\``, inline:true },
                { name:'🛡️ Resistência', value:`\`${inimigo.resistencia.toLocaleString()}\``, inline:true },
                { name:'👥 Party', value:party.map(id=>`<@${id}>`).join(', '), inline:false }
            ]).setFooter({ text:'Use c!acao <ataque/defesa/fuga> para agir' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!acao / c!ação
    // ==========================================
    if (command === 'acao' || command === 'ação') {
        const tipo = args[0]?.toLowerCase();
        const missao = missaoAtiva.get(message.author.id);
        if (!missao) return message.reply('❌ Você não está em nenhuma missão. Use `c!iniciarmissao`.');
        const player = getPlayer(message.author.id);
        const titles = loadTitles();
        const total = calcularTotal(player, message.member, titles);
        if (tipo === 'fugir') {
            const chance = Math.random();
            if (chance > 0.5) {
                missao.party.forEach(id => missaoAtiva.delete(id));
                return message.reply('🏃 **FUGA BEM-SUCEDIDA!** Você escapou da batalha.');
            }
            const dadoInimigo = Math.floor(Math.random()*20)+1;
            const danoFuga = Math.floor((missao.inimigo.forca*(dadoInimigo/10))/4);
            return message.reply(`❌ **FUGA FALHOU!** O inimigo atacou! Dano tomado: \`${danoFuga.toLocaleString()} HP\``);
        }
        const dadoAtk = Math.floor(Math.random()*20)+1;
        const dadoDef = Math.floor(Math.random()*20)+1;
        const danoDealt = Math.max(0, Math.floor((total.forca*(dadoAtk/10))/3));
        const danoTaken = Math.max(0, Math.floor((missao.inimigo.forca*(dadoDef/10))/4) - Math.floor(total.resistencia/10));
        missao.hpAtual = Math.max(0, missao.hpAtual - danoDealt);
        missao.turno++;
        const inimigoDerrotado = missao.hpAtual <= 0;
        if (inimigoDerrotado) {
            const recompensaIenes = { fraco:500, medio:2000, dificil:8000 }[missao.dificuldade]||500;
            player.kills = (player.kills||0)+1;
            player.ienes = (player.ienes||0)+recompensaIenes;
            savePlayer(message.author.id, player);
            missao.party.forEach(id => missaoAtiva.delete(id));
            const embed = new EmbedBuilder().setColor('#FFD700')
                .setTitle('🏆 VITÓRIA! INIMIGO DERROTADO!')
                .setDescription(`**${missao.inimigo.nome}** foi eliminado!`)
                .addFields([
                    { name:'💴 Recompensa', value:`+${recompensaIenes.toLocaleString()} Ienes`, inline:true },
                    { name:'💀 Kills', value:`Total: ${player.kills}`, inline:true }
                ]).setTimestamp();
            return message.reply({ embeds:[embed] });
        }
        const pctHP = Math.round((missao.hpAtual/missao.inimigo.hp)*100);
        const embed = new EmbedBuilder().setColor('#E74C3C')
            .setTitle(`⚔️ TURNO ${missao.turno} — ${missao.inimigo.nome}`)
            .addFields([
                { name:'💥 Dano Causado', value:`\`${danoDealt.toLocaleString()} HP\``, inline:true },
                { name:'🛡️ Dano Sofrido', value:`\`${danoTaken.toLocaleString()} HP\``, inline:true },
                { name:`❤️ HP Inimigo (${pctHP}%)`, value:`\`${barra(missao.hpAtual,missao.inimigo.hp)}\` ${missao.hpAtual.toLocaleString()}/${missao.inimigo.hp.toLocaleString()}`, inline:false }
            ]).setFooter({ text:'c!acao <ataque/defesa/fugir> para continuar' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ❌ COMMAND: c!cancelarmissao
    // ==========================================
    if (command === 'cancelarmissao') {
        if (!missaoAtiva.has(message.author.id)) return message.reply('❌ Você não está em nenhuma missão.');
        const missao = missaoAtiva.get(message.author.id);
        missao.party.forEach(id => missaoAtiva.delete(id));
        return message.reply('✅ Missão cancelada. A batalha foi abandonada.');
    }

    // ==========================================
    // ⚔️ COMMAND: c!x1 / c!duelo
    // ==========================================
    if (command === 'x1' || command === 'duelo') {
        const alvo = message.mentions.users.first();
        if (!alvo || alvo.id === message.author.id) return message.reply('❌ Mencione um oponente válido: `c!x1 @user`');
        if (dueloAtivo.has(message.author.id)||dueloAtivo.has(alvo.id)) return message.reply('❌ Um dos lutadores já está em duelo!');
        const playerAtk = getPlayer(message.author.id);
        const playerDef = getPlayer(alvo.id);
        const titles = loadTitles();
        const totalAtk = calcularTotal(playerAtk, message.guild.members.cache.get(message.author.id), titles);
        const totalDef = calcularTotal(playerDef, message.guild.members.cache.get(alvo.id), titles);
        const hpAtk = Math.floor(totalAtk.resistencia*1.5+1000);
        const hpDef = Math.floor(totalDef.resistencia*1.5+1000);
        const duelo = { atk:message.author.id, def:alvo.id, hpAtk, hpDef, hpAtkMax:hpAtk, hpDefMax:hpDef, turno:1, statsAtk:totalAtk, statsDef:totalDef };
        dueloAtivo.set(message.author.id, duelo);
        dueloAtivo.set(alvo.id, duelo);
        const embed = new EmbedBuilder().setColor('#FF6B35')
            .setTitle('⚔️ ARENA PVP — DUELO MORTAL')
            .setDescription(`<@${message.author.id}> **desafiou** <@${alvo.id}> para um duelo!`)
            .addFields([
                { name:`⚔️ ${message.author.username}`, value:`❤️ HP: \`${hpAtk.toLocaleString()}\`\n💥 Força: \`${totalAtk.forca.toLocaleString()}\``, inline:true },
                { name:'VS', value:'⚔️', inline:true },
                { name:`⚔️ ${alvo.username}`, value:`❤️ HP: \`${hpDef.toLocaleString()}\`\n💥 Força: \`${totalDef.forca.toLocaleString()}\``, inline:true }
            ]).setFooter({ text:'Ambos usem c!lutar para atacar' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!lutar
    // ==========================================
    if (command === 'lutar') {
        const duelo = dueloAtivo.get(message.author.id);
        if (!duelo) return message.reply('❌ Você não está em nenhum duelo. Use `c!x1 @user`.');
        const isAtk = duelo.atk === message.author.id;
        const dado = Math.floor(Math.random()*20)+1;
        const statsAtacante = isAtk ? duelo.statsAtk : duelo.statsDef;
        const dano = Math.max(0, Math.floor((statsAtacante.forca*(dado/10))/3));
        const critico = dado===20;
        const danoFinal = critico ? Math.floor(dano*1.5) : dano;
        if (isAtk) duelo.hpDef = Math.max(0, duelo.hpDef-danoFinal);
        else duelo.hpAtk = Math.max(0, duelo.hpAtk-danoFinal);
        duelo.turno++;
        const morreu = isAtk ? duelo.hpDef<=0 : duelo.hpAtk<=0;
        if (morreu) {
            const venc = isAtk ? duelo.atk : duelo.def;
            const perd = isAtk ? duelo.def : duelo.atk;
            const pvenc = getPlayer(venc); pvenc.kills=(pvenc.kills||0)+1;
            savePlayer(venc, pvenc);
            dueloAtivo.delete(duelo.atk); dueloAtivo.delete(duelo.def);
            const embed = new EmbedBuilder().setColor('#FFD700')
                .setTitle('🏆 DUELO ENCERRADO!')
                .setDescription(`<@${venc}> **VENCEU** o duelo contra <@${perd}>!\n\n*O campo de batalha ficou em silêncio.*`)
                .addFields([{ name:'💀 Kill registrada', value:`<@${venc}> +1 kill`, inline:false }]).setTimestamp();
            return message.reply({ embeds:[embed] });
        }
        const oponente = isAtk ? duelo.def : duelo.atk;
        const hpA = isAtk ? duelo.hpAtk : duelo.hpDef;
        const hpD = isAtk ? duelo.hpDef : duelo.hpAtk;
        const maxA = isAtk ? duelo.hpAtkMax : duelo.hpDefMax;
        const maxD = isAtk ? duelo.hpDefMax : duelo.hpAtkMax;
        const embed = new EmbedBuilder().setColor(critico?'#FFD700':'#FF6B35')
            .setTitle(`${critico?'⚡ GOLPE CRÍTICO!':'⚔️ ATAQUE'} — Turno ${duelo.turno}`)
            .addFields([
                { name:`💥 ${message.author.username}`, value:`${critico?'⚡ CRÍTICO! ':''}**-${danoFinal.toLocaleString()} HP**\n\`${barra(hpA,maxA)}\` ${hpA.toLocaleString()}`, inline:true },
                { name:`🛡️ <@${oponente}>`, value:`\`${barra(hpD,maxD)}\` ${hpD.toLocaleString()}`, inline:true }
            ]).setFooter({ text:'Vez do oponente atacar com c!lutar' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 😮‍💨 COMMAND: c!turno
    // ==========================================
    if (command === 'turno') {
        const turno = parseInt(args[0]);
        if (isNaN(turno)||turno<1) return message.reply('❌ Use: `c!turno <número do turno>`');
        const player = getPlayer(message.author.id);
        const total = calcularTotal(player, message.member, loadTitles());
        const folegoMax = total.folego;
        const consumoPorTurno = Math.floor(folegoMax*0.08);
        const folegoRestante = Math.max(0, folegoMax-(consumoPorTurno*turno));
        const pct = Math.round((folegoRestante/folegoMax)*100);
        const status = pct>70?'✅ Ótimo':pct>40?'⚠️ Cansado':pct>15?'😮‍💨 Exausto':'💀 Desmaiando';
        const embed = new EmbedBuilder().setColor(pct>70?'#2ECC71':pct>40?'#F39C12':pct>15?'#E74C3C':'#8B0000')
            .setTitle(`😮‍💨 FADIGA — TURNO ${turno}`)
            .addFields([
                { name:'🏮 Fôlego Restante', value:`\`${folegoRestante.toLocaleString()} / ${folegoMax.toLocaleString()}\``, inline:true },
                { name:'📊 Status', value:status, inline:true },
                { name:'Barra de Fôlego', value:`\`${barra(folegoRestante,folegoMax,15)}\` ${pct}%`, inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💫 COMMAND: c!aura
    // ==========================================
    if (command === 'aura') {
        const member = message.member;
        const player = getPlayer(message.author.id);
        const total = calcularTotal(player, member, loadTitles());
        const totalPoder = total.forca+total.resistencia+total.velocidade+total.reflexo;
        const frase = AURA_FRASES[Math.floor(Math.random()*AURA_FRASES.length)].replace('{u}',message.author.username);
        const embed = new EmbedBuilder().setColor(member?member.displayHexColor:'#9B59B6')
            .setTitle('💫 LIBERAÇÃO DE AURA ESPIRITUAL')
            .setDescription(`*${frase}*`)
            .addFields([
                { name:'⚡ Poder Total', value:`## \`${totalPoder.toLocaleString()}\``, inline:false },
                { name:'💥 Força', value:`\`${total.forca.toLocaleString()}\``, inline:true },
                { name:'🛡️ Resistência', value:`\`${total.resistencia.toLocaleString()}\``, inline:true },
                { name:'💨 Velocidade', value:`\`${total.velocidade.toLocaleString()}\``, inline:true },
                { name:'👁️ Reflexo', value:`\`${total.reflexo.toLocaleString()}\``, inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚡ COMMAND: c!ativar / c!desativar
    // ==========================================
    if (command === 'ativar' || command === 'desativar') {
        const habilidade = args.join(' ');
        if (!habilidade) return message.reply(`❌ Use: \`c!${command} <nome da habilidade>\``);
        const player = getPlayer(message.author.id);
        if (!player.habilidadesAtivas) player.habilidadesAtivas = [];
        if (command === 'ativar') {
            const habilidadesValidas = Object.keys(habilidadesRoles).map(k=>normalizarNome(k));
            const hasRole = message.member?.roles.cache.some(r => normalizarNome(r.name).includes(normalizarNome(habilidade)));
            if (!hasRole) return message.reply(`❌ Você não possui a habilidade **${habilidade}**.`);
            if (!player.habilidadesAtivas.includes(habilidade)) player.habilidadesAtivas.push(habilidade);
            savePlayer(message.author.id, player);
            const embed = new EmbedBuilder().setColor('#FFD700').setTitle(`⚡ HABILIDADE ATIVADA`).setDescription(`✅ **${habilidade}** foi ativada!\n*Seu poder aumentou significativamente.*`).setTimestamp();
            return message.reply({ embeds:[embed] });
        } else {
            player.habilidadesAtivas = player.habilidadesAtivas.filter(h=>!normalizarNome(h).includes(normalizarNome(habilidade)));
            savePlayer(message.author.id, player);
            return message.reply(`✅ Habilidade **${habilidade}** desativada.`);
        }
    }

    // ==========================================
    // 💥 COMMAND: c!combo
    // ==========================================
    if (command === 'combo') {
        const player = getPlayer(message.author.id);
        if (!player.lacos?.dupla) return message.reply('❌ Você não tem uma **Dupla** definida. Peça à Staff para usar `c!addlaco dupla`.');
        const duplaId = player.lacos.dupla;
        const parceiro = getPlayer(duplaId);
        const titles = loadTitles();
        const total1 = calcularTotal(player, message.member, titles);
        const total2 = calcularTotal(parceiro, message.guild?.members.cache.get(duplaId), titles);
        const dado = Math.floor(Math.random()*20)+1;
        const danoCombo = Math.floor(((total1.forca+total2.forca)*1.5*(dado/10))/3);
        const embed = new EmbedBuilder().setColor('#FF6B35')
            .setTitle('💥 ATAQUE COMBO DE DUPLA!')
            .setDescription(`*As respirações se fundiram. O golpe combinado foi lançado!*`)
            .addFields([
                { name:'🎲 Dado', value:`\`🎲 ${dado}/20\``, inline:true },
                { name:'💥 Dano Total', value:`## \`${danoCombo.toLocaleString()} HP\``, inline:false },
                { name:'🔥 Parceiro', value:`<@${duplaId}>`, inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🔥 COMMAND: c!motivacao
    // ==========================================
    if (command === 'motivacao') {
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'motivacao', 48);
        if (cd) return message.reply(`⏳ Sua vontade ainda está se recuperando. Aguarde **${cd}**.`);
        const titles = loadTitles();
        const total = calcularTotal(player, message.member, titles);
        const bonusTmp = Math.floor(total.forca*0.5);
        setCooldown(player, 'motivacao');
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#FF0000')
            .setTitle('🔥 SUPERANDO OS LIMITES!')
            .setDescription(`*"Não importa o quão difícil seja... eu nunca vou desistir!"*\n\n**${message.author.username}** superou seus limites!`)
            .addFields([
                { name:'⬆️ Bônus Temporário', value:`+${bonusTmp.toLocaleString()} Força (1 turno)`, inline:true },
                { name:'⏳ Cooldown', value:'`48 horas`', inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🌅 COMMAND: c!vontade
    // ==========================================
    if (command === 'vontade') {
        const player = getPlayer(message.author.id);
        if (!player.liderKamado) return message.reply('❌ Apenas o **Líder Kamado** pode ativar os olhos de Yoriichi.');
        const cd = checkCooldown(player, 'vontade', 72);
        if (cd) return message.reply(`⏳ Os olhos de Yoriichi estão dormentes. Aguarde **${cd}**.`);
        setCooldown(player, 'vontade');
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#FF6600')
            .setTitle('🌅 OLHOS DE YORIICHI ATIVADOS')
            .setDescription(`*O mundo ficou transparente. Cada movimento, cada fraqueza, cada ponto vital... tudo visível.*\n\n✅ **Mundo Transparente** + **Chamas do Sol** ativados por 3 turnos.`)
            .addFields([{ name:'⚡ Bônus', value:'Reflexo e Velocidade +50.000 por 3 turnos', inline:false }]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🔫 COMMAND: c!atirar / c!recarregar
    // ==========================================
    if (command === 'atirar') {
        const player = getPlayer(message.author.id);
        if (!player.inventario?.escopeta) return message.reply('❌ Você não possui uma **Escopeta Nichirin**. Compre em `c!loja`.');
        if ((player.inventario.balas||0) <= 0) return message.reply('❌ Sem munição! Use `c!recarregar` primeiro.');
        const dado = Math.floor(Math.random()*20)+1;
        const dano = Math.floor(dado*5000*(1+(player.carmesim||0)*0.35));
        player.inventario.balas--;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#FF4500')
            .setTitle('🔫 DISPARO DE ESCOPETA NICHIRIN')
            .addFields([
                { name:'🎲 Precisão', value:`\`🎲 ${dado}/20\``, inline:true },
                { name:'💥 Dano', value:`\`${dano.toLocaleString()} HP\``, inline:true },
                { name:'🔴 Balas Restantes', value:`\`${player.inventario.balas}\``, inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }
    if (command === 'recarregar') {
        const player = getPlayer(message.author.id);
        if (!player.inventario?.escopeta) return message.reply('❌ Você não possui uma **Escopeta Nichirin**.');
        if ((player.inventario.balasCarga||0) <= 0) return message.reply('❌ Sem **Cargas Carmesim**! Compre em `c!loja comprar bala`.');
        player.inventario.balas = (player.inventario.balas||0)+2;
        player.inventario.balasCarga--;
        savePlayer(message.author.id, player);
        return message.reply(`✅ Escopeta recarregada! Balas: \`${player.inventario.balas}\``);
    }

    // ==========================================
    // 🌿 COMMAND: c!procuralirio
    // ==========================================
    if (command === 'procuralirio') {
        const player = getPlayer(message.author.id);
        const cd = checkCooldown(player, 'lirio', 6);
        if (cd) return message.reply(`⏳ Aguarde **${cd}** para explorar novamente.`);
        const local = LIRIOS_LOCAIS[Math.floor(Math.random()*LIRIOS_LOCAIS.length)];
        const encontrou = Math.random() < 0.6;
        const itens = ['lirioAzul','lirioVermelho','sangueLivre'];
        const item = itens[Math.floor(Math.random()*itens.length)];
        setCooldown(player, 'lirio');
        if (encontrou) {
            player.medicina = player.medicina||{};
            player.medicina[item] = (player.medicina[item]||0)+1;
        }
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor(encontrou?'#27AE60':'#7F8C8D')
            .setTitle(`🌿 EXPLORAÇÃO — ${local}`)
            .setDescription(encontrou
                ? `*Você vasculhou o local e encontrou algo raro...*\n\n✅ **+1 ${LIRIO_NOMES[item]}** coletado!`
                : `*Você procurou por horas mas não encontrou nada desta vez.*`
            ).setFooter({ text:'Cooldown de 6h entre explorações' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🧪 COMMAND: c!fabricar
    // ==========================================
    if (command === 'fabricar') {
        const num = parseInt(args[0]);
        if (!FABRICAR_COMPOSTOS[num]) return message.reply('❌ Use: `c!fabricar <1/2/3/4>`\n`1` Básico ┋ `2` Tóxico ┋ `3` Carmesim ┋ `4` Akuma');
        const player = getPlayer(message.author.id);
        const comp = FABRICAR_COMPOSTOS[num];
        player.medicina = player.medicina||{};
        for (const [ing, qtd] of Object.entries(comp.ing)) {
            if ((player.medicina[ing]||0)<qtd) return message.reply(`❌ Ingredientes insuficientes!\nFaltam: **${qtd-(player.medicina[ing]||0)}x ${LIRIO_NOMES[ing]||ing}**`);
        }
        for (const [ing, qtd] of Object.entries(comp.ing)) player.medicina[ing]-=qtd;
        player.medicina.compostos = player.medicina.compostos||{};
        player.medicina.compostos[`c${num}`] = true;
        savePlayer(message.author.id, player);
        const embed = new EmbedBuilder().setColor('#8B0000')
            .setTitle(`🧪 COMPOSTO FABRICADO`)
            .setDescription(`*Os ingredientes se misturaram. O composto está pronto.*\n\n✅ **${comp.nome}** fabricado com sucesso!`)
            .addFields([{ name:'⚗️ Efeito', value:comp.efeito, inline:false }]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💉 COMMAND: c!injetar
    // ==========================================
    if (command === 'injetar') {
        const num = parseInt(args[0]);
        if (!FABRICAR_COMPOSTOS[num]) return message.reply('❌ Use: `c!injetar <1/2/3/4>`');
        const player = getPlayer(message.author.id);
        player.medicina = player.medicina||{};
        player.medicina.compostos = player.medicina.compostos||{};
        if (!player.medicina.compostos[`c${num}`]) return message.reply('❌ Você não possui esse composto. Use `c!fabricar` primeiro.');
        player.medicina.compostos[`c${num}`] = false;
        savePlayer(message.author.id, player);
        const comp = FABRICAR_COMPOSTOS[num];
        const embed = new EmbedBuilder().setColor('#8B0000')
            .setTitle('💉 COMPOSTO INJETADO')
            .setDescription(`*O líquido foi aplicado. O efeito começa a agir...*\n\n⚗️ **${comp.nome}** — ${comp.efeito}`)
            .setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💴 COMMAND: c!carteira / c!money
    // ==========================================
    if (command === 'carteira' || command === 'money') {
        const player = getPlayer(message.author.id);
        const embed = new EmbedBuilder().setColor('#F1C40F')
            .setTitle('💴 CARTEIRA')
            .addFields([
                { name:'💴 Ienes', value:`## \`${(player.ienes||0).toLocaleString()} ¥\``, inline:true },
                { name:'💎 Kcoins', value:`## \`${(player.kcoins||0).toLocaleString()} KC\``, inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🛒 COMMAND: c!loja / c!comprar
    // ==========================================
    if (command === 'loja') {
        const linhas = Object.entries(LOJA_ITENS).map(([key,v])=>`> 🔹 **${v.nome}** — \`${v.preco.toLocaleString()} Ienes\`\n> ${v.descricao}\n> Comprar: \`c!comprar ${key}\``);
        const embed = new EmbedBuilder().setColor('#F1C40F').setTitle('🛒 LOJA DO CLÃ')
            .setDescription(linhas.join('\n\n')).setFooter({ text:'c!comprar <item> para adquirir' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }
    if (command === 'comprar') {
        const item = args[0]?.toLowerCase();
        const dados = LOJA_ITENS[item];
        if (!dados) return message.reply(`❌ Item não encontrado. Use \`c!loja\` para ver os itens disponíveis.`);
        const player = getPlayer(message.author.id);
        if ((player.ienes||0)<dados.preco) return message.reply(`❌ Ienes insuficientes! Você tem \`${(player.ienes||0).toLocaleString()}\` e precisa de \`${dados.preco.toLocaleString()}\`.`);
        player.ienes = (player.ienes||0)-dados.preco;
        player.inventario = player.inventario||{};
        if (item==='escopeta') player.inventario.escopeta=true;
        else if (item==='bala') player.inventario.balasCarga=(player.inventario.balasCarga||0)+1;
        else player.inventario[item]=(player.inventario[item]||0)+1;
        savePlayer(message.author.id, player);
        return message.reply(`✅ **${dados.nome}** comprado! Saldo restante: \`${player.ienes.toLocaleString()} Ienes\``);
    }

    // ==========================================
    // 💎 COMMAND: c!kcoins
    // ==========================================
    if (command === 'kcoins') {
        const player = getPlayer(message.author.id);
        const embed = new EmbedBuilder().setColor('#9B59B6')
            .setTitle('💎 SALDO DE KCOINS')
            .setDescription(`## \`${(player.kcoins||0).toLocaleString()} Kcoins\`\n\n*Use \`c!lojavip\` para gastar suas moedas premium!*`).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💎 COMMAND: c!lojavip / c!lojakcoins
    // ==========================================
    if (command === 'lojavip' || command === 'lojakcoins') {
        const linhas = Object.entries(LOJA_VIP).map(([key,v])=>`> 💎 **${v.nome}** — \`${v.kcoins} Kcoins\`\n> ${v.descricao}\n> Comprar: \`c!comprarkcoins ${key}\``);
        const embed = new EmbedBuilder().setColor('#9B59B6').setTitle('💎 LOJA VIP — KCOINS')
            .setDescription(linhas.join('\n\n')).setFooter({ text:'c!comprarkcoins <item> para adquirir' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💎 COMMAND: c!vip / c!comprarkcoins
    // ==========================================
    if (command === 'vip' || command === 'comprarkcoins') {
        if (command === 'vip') {
            const embed = new EmbedBuilder().setColor('#9B59B6').setTitle('💎 PLANOS VIP — KCOINS')
                .setDescription('Para adquirir Kcoins e ter acesso a rolls e boosts exclusivos, entre em contato com a Staff via DM.\n\n> 💎 **100 Kcoins** — R$ 5,00\n> 💎 **250 Kcoins** — R$ 10,00\n> 💎 **600 Kcoins** — R$ 20,00\n> 💎 **1500 Kcoins** — R$ 45,00')
                .setFooter({ text:'Pagamento via PIX • Contato: Staff do servidor' }).setTimestamp();
            return message.reply({ embeds:[embed] });
        }
        const item = args[0]?.toLowerCase();
        const dados = LOJA_VIP[item];
        if (!dados) return message.reply(`❌ Item não encontrado. Use \`c!lojavip\` para ver os itens disponíveis.`);
        const player = getPlayer(message.author.id);
        if ((player.kcoins||0)<dados.kcoins) return message.reply(`❌ Kcoins insuficientes! Você tem \`${(player.kcoins||0)}\` e precisa de \`${dados.kcoins}\`.`);
        player.kcoins = (player.kcoins||0)-dados.kcoins;
        player.rolls = player.rolls||{};
        if (item.startsWith('roll-')) { const tipo = item.replace('roll-',''); player.rolls[tipo]=(player.rolls[tipo]||0)+1; }
        else if (item.startsWith('skip-')) { const tipo = item==='skip-treino'?'Skip-Treino':'Skip-Alimentacao'; player.rolls[tipo]=(player.rolls[tipo]||0)+1; }
        savePlayer(message.author.id, player);
        return message.reply(`✅ **${dados.nome}** adquirido! Saldo: \`${player.kcoins} Kcoins\``);
    }

    // ==========================================
    // 🎁 COMMAND: c!code
    // ==========================================
    if (command === 'code') {
        const codigo = args[0];
        if (!codigo) return message.reply('❌ Use: `c!code <código>`');
        const codes = loadCodes();
        if (!codes[codigo]) return message.reply('❌ Código inválido ou já expirado.');
        const player = getPlayer(message.author.id);
        if (!player.usedCodes) player.usedCodes = [];
        if (player.usedCodes.includes(codigo)) return message.reply('❌ Você já usou este código.');
        const recompensa = codes[codigo];
        player.usedCodes.push(codigo);
        if (recompensa.ienes) player.ienes = (player.ienes||0)+recompensa.ienes;
        if (recompensa.kcoins) player.kcoins = (player.kcoins||0)+recompensa.kcoins;
        if (recompensa.rolls) Object.entries(recompensa.rolls).forEach(([k,v])=>{ player.rolls=player.rolls||{}; player.rolls[k]=(player.rolls[k]||0)+v; });
        codes[codigo].usos = (codes[codigo].usos||0)+1;
        if (codes[codigo].maxUsos && codes[codigo].usos >= codes[codigo].maxUsos) delete codes[codigo];
        saveCodes(codes);
        savePlayer(message.author.id, player);
        const linhas = [];
        if (recompensa.ienes) linhas.push(`💴 **+${recompensa.ienes.toLocaleString()} Ienes**`);
        if (recompensa.kcoins) linhas.push(`💎 **+${recompensa.kcoins} Kcoins**`);
        if (recompensa.rolls) Object.entries(recompensa.rolls).forEach(([k,v])=>linhas.push(`🎴 **+${v}x ${k}**`));
        const embed = new EmbedBuilder().setColor('#2ECC71').setTitle('🎁 CÓDIGO RESGATADO!')
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🎁 COMMAND: c!doar
    // ==========================================
    if (command === 'doar') {
        const alvo = message.mentions.users.first();
        const tipo = args[1]?.toLowerCase();
        const qtd = parseInt(args[2]);
        if (!alvo||!tipo||isNaN(qtd)||qtd<1) return message.reply('❌ Use: `c!doar @user <item> <qtd>`\nExemplo: `c!doar @User Roll-Nichirin 1`');
        const jogador = getPlayer(message.author.id);
        const rolaTipo = Object.keys(NOMES_EXIBICAO).find(k=>normalizarNome(k)===normalizarNome(tipo))||tipo;
        if (!jogador.rolls||!jogador.rolls[rolaTipo]||(jogador.rolls[rolaTipo]<qtd))
            return message.reply(`❌ Você não tem **${qtd}x ${rolaTipo}** para doar.`);
        jogador.rolls[rolaTipo]-=qtd;
        const alvoPlayer = getPlayer(alvo.id);
        alvoPlayer.rolls=alvoPlayer.rolls||{};
        alvoPlayer.rolls[rolaTipo]=(alvoPlayer.rolls[rolaTipo]||0)+qtd;
        savePlayer(message.author.id, jogador);
        savePlayer(alvo.id, alvoPlayer);
        return message.reply(`✅ **${qtd}x ${rolaTipo}** enviado para <@${alvo.id}>!`);
    }

    // ==========================================
    // 🔄 COMMAND: c!trocarperfil / c!trade
    // ==========================================
    if (command === 'trocarperfil' || command === 'trade') {
        const alvo = message.mentions.users.first();
        const tipo = args[1]?.toLowerCase();
        if (!alvo||!tipo||!['cla','kekkijutsu','respiracao'].includes(tipo))
            return message.reply('❌ Use: `c!trade @user <cla/kekkijutsu/respiracao>`');
        const p1 = getPlayer(message.author.id);
        const p2 = getPlayer(alvo.id);
        const val1 = p1[tipo], val2 = p2[tipo];
        p1[tipo]=val2; p2[tipo]=val1;
        savePlayer(message.author.id, p1);
        savePlayer(alvo.id, p2);
        return message.reply(`✅ **${tipo.toUpperCase()}** trocado entre <@${message.author.id}> e <@${alvo.id}>!\n> ${message.author.username}: \`${val2||'Nenhum'}\`\n> ${alvo.username}: \`${val1||'Nenhum'}\``);
    }

    // ==========================================
    // 🔗 COMMAND: c!lacos / c!laços
    // ==========================================
    if (command === 'lacos' || command === 'laços') {
        const player = getPlayer(message.author.id);
        const lacos = player.lacos||{ amizade:[], rivalidade:[], dupla:null };
        const fmt = (arr) => arr.length ? arr.map(id=>`<@${id}>`).join(', ') : '`Nenhum`';
        const embed = new EmbedBuilder().setColor('#E91E8C').setTitle('🔗 TEIA DE RELAÇÕES')
            .addFields([
                { name:'💙 Amizades', value:fmt(lacos.amizade||[]), inline:false },
                { name:'⚔️ Rivalidades', value:fmt(lacos.rivalidade||[]), inline:false },
                { name:'💞 Dupla', value:lacos.dupla ? `<@${lacos.dupla}>` : '`Nenhuma`', inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ❓ COMMAND: c!help / c!ajuda
    // ==========================================
    if (command === 'help' || command === 'ajuda') {
        const embed = new EmbedBuilder().setColor('#2b2d31').setTitle('⛩️ MENU DE AJUDA — GUIA COMPLETO')
            .addFields([
                { name:'🎴 INÍCIO & ROLLS', value:'`c!start-h` `c!start-o` `c!cla-h` `c!cla-o` `c!roll-nichirin` `c!prodigio` `c!marca-nascenca` `c!marca-maldicao` `c!quebra-maldicao` `c!marechi` `c!sentidos` `c!rolltreino` `c!rollfinal`', inline:false },
                { name:'📊 PERFIL & STATUS', value:'`c!perfil` `c!status` `c!cargos` `c!setimagem`', inline:false },
                { name:'🏋️ TREINO & ROTINA', value:'`c!treinar` `c!treinarmaestria` `c!treinarsentido` `c!ver-sentidos` `c!alimentar` `c!dormir` `c!acordar` `c!regen` `c!evoluir`', inline:false },
                { name:'⚔️ COMBATE & RPG', value:'`c!formas` `c!tecnicas` `c!dano` `c!reagir` `c!iniciarmissao` `c!acao` `c!cancelarmissao` `c!x1` `c!lutar` `c!turno` `c!aura` `c!ativar` `c!desativar` `c!combo` `c!motivacao` `c!atirar` `c!recarregar` `c!procuralirio` `c!fabricar` `c!injetar`', inline:false },
                { name:'💴 ECONOMIA', value:'`c!carteira` `c!loja` `c!comprar` `c!kcoins` `c!lojavip` `c!vip` `c!code` `c!doar` `c!trade` `c!lacos`', inline:false },
                { name:'📚 INFO & RANKINGS', value:'`c!rank` `c!rankstatus` `c!rankhumano` `c!rankoni` `c!rankkill` `c!estilos` `c!kekkis` `c!listaclas` `c!hashiras` `c!aprendizes` `c!entrarselecao` `c!listaselecao`', inline:false }
            ]).setFooter({ text:'Staff: c!helpadmin • Prefixo: c!' }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🏆 COMMAND: c!rank
    // ==========================================
    if (command === 'rank') {
        const data = loadPlayers();
        const titles = loadTitles();
        const ranking = Object.entries(data).map(([id,p]) => {
            const t = calcularTotal(p, null, titles);
            return { id, poder: t.forca+t.resistencia+t.velocidade+t.reflexo };
        }).sort((a,b)=>b.poder-a.poder).slice(0,10);
        const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        const linhas = ranking.map((r,i)=>`${medalhas[i]} <@${r.id}> — \`${r.poder.toLocaleString()}\` pts`);
        const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🏆 TOP 10 — PODER GLOBAL')
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 📊 COMMAND: c!rankstatus
    // ==========================================
    if (command === 'rankstatus') {
        const stat = args[0]?.toLowerCase();
        const validos = ['forca','resistencia','velocidade','reflexo'];
        if (!validos.includes(stat)) return message.reply(`❌ Use: \`c!rankstatus <${validos.join('/')}>\``);
        const data = loadPlayers();
        const ranking = Object.entries(data).sort((a,b)=>(Number(b[1][stat])||0)-(Number(a[1][stat])||0)).slice(0,10);
        const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        const emojis = {forca:'💥',resistencia:'🛡️',velocidade:'💨',reflexo:'👁️'};
        const linhas = ranking.map(([id,p],i)=>`${medalhas[i]} <@${id}> — ${emojis[stat]} \`${(Number(p[stat])||0).toLocaleString()}\``);
        const embed = new EmbedBuilder().setColor('#3498DB').setTitle(`📊 TOP 10 — ${stat.toUpperCase()}`)
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 📊 COMMAND: c!rankhumano / c!rankoni
    // ==========================================
    if (command === 'rankhumano' || command === 'rankoni') {
        const racaFiltro = command === 'rankhumano' ? 'humano' : 'oni';
        const data = loadPlayers();
        const titles = loadTitles();
        const ranking = Object.entries(data).filter(([,p])=>p.raca===racaFiltro).map(([id,p])=>{
            const t = calcularTotal(p,null,titles);
            return { id, poder:t.forca+t.resistencia+t.velocidade+t.reflexo };
        }).sort((a,b)=>b.poder-a.poder).slice(0,10);
        const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        const emoji = racaFiltro==='humano'?'⚔️':'👺';
        const embed = new EmbedBuilder().setColor(racaFiltro==='humano'?'#4169E1':'#8B0000')
            .setTitle(`${emoji} TOP 10 ${racaFiltro.toUpperCase()}S — PODER`)
            .setDescription(ranking.length?ranking.map((r,i)=>`${medalhas[i]} <@${r.id}> — \`${r.poder.toLocaleString()}\``).join('\n'):'*Nenhum encontrado*').setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💀 COMMAND: c!rankkill
    // ==========================================
    if (command === 'rankkill') {
        const data = loadPlayers();
        const ranking = Object.entries(data).sort((a,b)=>(b[1].kills||0)-(a[1].kills||0)).slice(0,10);
        const medalhas = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        const linhas = ranking.map(([id,p],i)=>`${medalhas[i]} <@${id}> — \`${p.kills||0} kills\``);
        const embed = new EmbedBuilder().setColor('#8B0000').setTitle('💀 TOP 10 — PLACAR DE MORTES')
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🌬️ COMMAND: c!estilos / c!kekkis
    // ==========================================
    if (command === 'estilos' || command === 'kekkis') {
        const data = loadPlayers();
        const campo = command==='estilos'?'respiracao':'kekkijutsu';
        const mapa = {};
        Object.entries(data).forEach(([id,p])=>{
            const val = p[campo];
            if (val && val!=='nenhuma') { if (!mapa[val]) mapa[val]=[]; mapa[val].push(id); }
        });
        const linhas = Object.entries(mapa).map(([val,ids])=>`> ${command==='estilos'?'🌬️':'🩸'} **${val.toUpperCase()}**\n> ${ids.map(id=>`<@${id}>`).join(', ')}`);
        const embed = new EmbedBuilder().setColor(command==='estilos'?'#3498DB':'#8B0000')
            .setTitle(command==='estilos'?'🌬️ ESTILOS DE RESPIRAÇÃO NO SERVIDOR':'🩸 KEKKIJUTSU NO SERVIDOR')
            .setDescription(linhas.length?linhas.join('\n\n'):'*Nenhum registrado.*').setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💮 COMMAND: c!listaclas
    // ==========================================
    if (command === 'listaclas') {
        const data = loadPlayers();
        const mapa = {};
        Object.entries(data).forEach(([id,p])=>{ if (p.cla) { if (!mapa[p.cla]) mapa[p.cla]=[]; mapa[p.cla].push(id); } });
        const linhas = Object.entries(mapa).sort((a,b)=>a[0].localeCompare(b[0])).map(([cla,ids])=>`> 💮 **${CLAS_DISPLAY[cla]||cla}** (${ids.length})\n> ${ids.map(id=>`<@${id}>`).join(', ')}`);
        const embed = new EmbedBuilder().setColor('#9B59B6').setTitle('💮 LIVRO GENEALÓGICO — TODOS OS CLÃS')
            .setDescription(linhas.length?linhas.join('\n\n').slice(0,3990):'*Nenhum clã registrado.*').setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 💫 COMMAND: c!hashiras
    // ==========================================
    if (command === 'hashiras') {
        const h = loadHashiras();
        const posicoes = ['agua','chamas','vento','trovao','sol','lua','nevoa','inseto','flor','serpente','pedra','som','fera','Hinokami Kagura'];
        const emojis = {'agua':'💧','chamas':'🔥','vento':'🌪️','trovao':'⚡','sol':'☀️','lua':'🌕','nevoa':'🌫️','inseto':'🦋','flor':'🌸','serpente':'🐍','pedra':'🪨','som':'🎵','fera':'🐗','Hinokami Kagura':'🌅'};
        const linhas = posicoes.map(p=>`> ${emojis[p]||'⚔️'} **Pilar de ${p.charAt(0).toUpperCase()+p.slice(1)}:** ${h[p]?`<@${h[p].id}>`:'`Vago`'}`);
        const embed = new EmbedBuilder().setColor('#FFD700').setTitle('💫 PAINEL DOS HASHIRAS — PILARES DO CLÃ')
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🌅 COMMAND: c!aprendizes
    // ==========================================
    if (command === 'aprendizes') {
        const ap = loadAprendizes();
        const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🌅 APRENDIZES — LINHAGEM SOLAR E LUNAR')
            .addFields([
                { name:'☀️ Respiração do Sol', value:['slot1','slot2'].map((s,i)=>ap.solar?.[s]?`${i+1}. <@${ap.solar[s]}>`:`${i+1}. \`Vago\``).join('\n')||'`Nenhum`', inline:true },
                { name:'🌙 Respiração da Lua', value:['slot1','slot2'].map((s,i)=>ap.lunar?.[s]?`${i+1}. <@${ap.lunar[s]}>`:`${i+1}. \`Vago\``).join('\n')||'`Nenhum`', inline:true }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 📋 COMMAND: c!entrarselecao / c!sairselecao
    // ==========================================
    if (command === 'entrarselecao') {
        const geral = loadGeral();
        geral.selecao = geral.selecao||[];
        if (geral.selecao.includes(message.author.id)) return message.reply('❌ Você já está na fila de seleção!');
        geral.selecao.push(message.author.id);
        saveGeral(geral);
        return message.reply(`✅ **${message.author.username}** entrou na fila da Seleção Final! Posição: \`${geral.selecao.length}\``);
    }
    if (command === 'sairselecao') {
        const geral = loadGeral();
        geral.selecao = (geral.selecao||[]).filter(id=>id!==message.author.id);
        saveGeral(geral);
        return message.reply('✅ Você saiu da fila da Seleção Final.');
    }

    // ==========================================
    // 📋 COMMAND: c!listaselecao
    // ==========================================
    if (command === 'listaselecao') {
        const geral = loadGeral();
        const lista = geral.selecao||[];
        const embed = new EmbedBuilder().setColor('#4169E1').setTitle('📋 FILA DA SELEÇÃO FINAL')
            .setDescription(lista.length?lista.map((id,i)=>`${i+1}. <@${id}>`).join('\n'):'*Nenhum na fila.*')
            .setFooter({ text:`Total: ${lista.length} na fila` }).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // ⚔️ COMMAND: c!desafiar
    // ==========================================
    if (command === 'desafiar') {
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Mencione o Oni que deseja desafiar: `c!desafiar @oni`');
        const embed = new EmbedBuilder().setColor('#8B0000')
            .setTitle('⚔️ BATALHA DE SANGUE — DESAFIO ENVIADO')
            .setDescription(`<@${message.author.id}> desafiou <@${alvo.id}> para uma **Batalha de Sangue**!\n\n*A Staff precisa validar o duelo com \`c!validarbatalha\` antes de iniciar.*`)
            .setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 👑 COMMAND: c!helpadmin
    // ==========================================
    if (command === 'helpadmin') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const embed = new EmbedBuilder().setColor('#E74C3C').setTitle('👑 PAINEL DA STAFF')
            .addFields([
                { name:'📊 STATUS', value:'`c!addstatus` `c!removerstatus` `c!addlevel` `c!setperfil` `c!setcla` `c!resetcla`', inline:false },
                { name:'🎴 ROLLS & ITENS', value:'`c!addrolls` `c!setkill` `c!addkill` `c!addkcoins` `c!fixrolls`', inline:false },
                { name:'🏆 CARGOS & RANKS', value:'`c!sethashira` `c!setaprendiz` `c!removeraprendiz` `c!setliderkamado` `c!setonilivre` `c!sethibrido`', inline:false },
                { name:'📝 PERFIS', value:'`c!setkekki` `c!resetkekki` `c!maketitle` `c!settitle` `c!settsuguko`', inline:false },
                { name:'⚔️ BATALHA', value:'`c!validarbatalha` `c!vitoriabatalha` `c!carmesim` `c!tirarcarmesim` `c!addlaco` `c!removelaco`', inline:false },
                { name:'🎮 SISTEMA', value:'`c!setcoma` `c!tirarcoma` `c!resetm` `c!aprovarselecao` `c!limparselecao` `c!ativarboneco` `c!vencerboneco` `c!addcode` `c!delcode` `c!missao` `c!debug` `c!reset` `c!resetall`', inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 📊 COMMAND: c!addstatus / c!removerstatus
    // ==========================================
    if (command === 'addstatus' || command === 'removerstatus') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const stat = args[1]?.toLowerCase();
        const valor = parseInt(args[2]);
        if (!alvo||!stat||isNaN(valor)) return message.reply(`❌ Use: \`c!${command} @user <stat> <valor>\``);
        const statsValidos = ['forca','resistencia','velocidade','reflexo','folego','ienes','kcoins','kills','maestria'];
        if (!statsValidos.includes(stat)) return message.reply(`❌ Stat inválido: ${statsValidos.join(', ')}`);
        const player = getPlayer(alvo.id);
        if (command==='addstatus') player[stat]=(Number(player[stat])||0)+valor;
        else player[stat]=Math.max(0,(Number(player[stat])||0)-valor);
        savePlayer(alvo.id, player);
        return message.reply(`✅ \`${stat}\` de <@${alvo.id}> ${command==='addstatus'?'aumentado em':'reduzido em'} \`${valor.toLocaleString()}\`. Total: \`${player[stat].toLocaleString()}\``);
    }

    // ==========================================
    // ⬆️ COMMAND: c!addlevel
    // ==========================================
    if (command === 'addlevel') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const nivel = parseInt(args[1]);
        if (!alvo||isNaN(nivel)) return message.reply('❌ Use: `c!addlevel @user <nivel>`');
        const player = getPlayer(alvo.id);
        const bonusPorNivel = 1000;
        ['forca','resistencia','velocidade','reflexo'].forEach(s=>{ player[s]=(Number(player[s])||0)+bonusPorNivel*nivel; });
        player.folego=(Number(player.folego)||0)+5000*nivel;
        savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> recebeu bônus de **${nivel} nível(is)** (+${(bonusPorNivel*nivel).toLocaleString()} em cada stat).`);
    }

    // ==========================================
    // 🎴 COMMAND: c!addrolls
    // ==========================================
    if (command === 'addrolls') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const tipoRoll = args[1];
        const qtd = parseInt(args[2])||1;
        if (!alvo||!tipoRoll) return message.reply('❌ Use: `c!addrolls @user <tipo> <qtd>`\nTipos: '+TODOS_ROLLS.join(', '));
        const player = getPlayer(alvo.id);
        player.rolls = player.rolls||{};
        player.rolls[tipoRoll]=(player.rolls[tipoRoll]||0)+qtd;
        savePlayer(alvo.id, player);
        return message.reply(`✅ **${qtd}x ${tipoRoll}** adicionado ao inventário de <@${alvo.id}>.`);
    }

    // ==========================================
    // 📝 COMMAND: c!setperfil
    // ==========================================
    if (command === 'setperfil') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const campo = args[1];
        const valor = args.slice(2).join(' ');
        if (!alvo||!campo||!valor) return message.reply('❌ Use: `c!setperfil @user <campo> <valor>`');
        const player = getPlayer(alvo.id);
        player[campo] = valor;
        savePlayer(alvo.id, player);
        return message.reply(`✅ Campo \`${campo}\` de <@${alvo.id}> definido para \`${valor}\`.`);
    }

    // ==========================================
    // 💮 COMMAND: c!setcla / c!resetcla
    // ==========================================
    if (command === 'setcla') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const cla = args[1];
        if (!alvo||!cla) return message.reply('❌ Use: `c!setcla @user <cla>`');
        if (!CLAS[cla]) return message.reply(`❌ Clã \`${cla}\` não encontrado.`);
        const player = getPlayer(alvo.id);
        const stats = CLAS[cla];
        player.cla = cla;
        player.forca = stats.forca||0;
        player.resistencia = stats.resistencia||0;
        player.velocidade = stats.velocidade||0;
        player.reflexo = stats.reflexo||0;
        player.folego = stats.folego||0;
        savePlayer(alvo.id, player);
        return message.reply(`✅ Clã de <@${alvo.id}> definido para **${CLAS_DISPLAY[cla]||cla}** com atributos base atualizados.`);
    }
    if (command === 'resetcla') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!resetcla @user`');
        const player = getPlayer(alvo.id);
        player.cla=null; player.forca=0; player.resistencia=0; player.velocidade=0; player.reflexo=0; player.folego=0;
        savePlayer(alvo.id, player);
        return message.reply(`✅ Clã de <@${alvo.id}> resetado.`);
    }

    // ==========================================
    // 🏷️ COMMAND: c!maketitle / c!settitle
    // ==========================================
    if (command === 'maketitle') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const rest = args.slice(1).join(' ');
        const partes = rest.split('+').map(p=>p.trim());
        if (!alvo||partes.length<1) return message.reply('❌ Use: `c!maketitle @user NomeTitulo + forca=5000 + resistencia=3000`');
        const nome = partes[0];
        const buffs = {};
        partes.slice(1).forEach(p=>{ const [k,v]=p.split('='); if(k&&v) buffs[k.trim()]=parseInt(v)||0; });
        const titles = loadTitles();
        titles[nome] = buffs;
        saveTitles(titles);
        const player = getPlayer(alvo.id);
        player.titulo = nome;
        savePlayer(alvo.id, player);
        return message.reply(`✅ Título **"${nome}"** criado e atribuído a <@${alvo.id}> com buffs: ${Object.entries(buffs).map(([k,v])=>`${k}: +${v}`).join(', ')}`);
    }
    if (command === 'settitle') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        const nome = args.slice(1).join(' ');
        if (!alvo||!nome) return message.reply('❌ Use: `c!settitle @user <nome do título>`');
        const player = getPlayer(alvo.id);
        player.titulo = nome;
        savePlayer(alvo.id, player);
        return message.reply(`✅ Título de <@${alvo.id}> definido para **"${nome}"**.`);
    }

    // ==========================================
    // 💀 COMMAND: c!setkill / c!addkill
    // ==========================================
    if (command === 'setkill') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const qtd = parseInt(args[1]);
        if (!alvo||isNaN(qtd)) return message.reply('❌ Use: `c!setkill @user <qtd>`');
        const player = getPlayer(alvo.id); player.kills=qtd; savePlayer(alvo.id, player);
        return message.reply(`✅ Kills de <@${alvo.id}> definido para \`${qtd}\`.`);
    }
    if (command === 'addkill') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!addkill @user`');
        const player = getPlayer(alvo.id); player.kills=(player.kills||0)+1; savePlayer(alvo.id, player);
        return message.reply(`✅ +1 kill para <@${alvo.id}>. Total: \`${player.kills}\`.`);
    }

    // ==========================================
    // 🎮 COMMAND: c!missao (admin - recompensa)
    // ==========================================
    if (command === 'missao') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const [racaA, dificuldadeA, qtdA, valorA, sucessoA] = args;
        const qtd = parseInt(qtdA)||1;
        const valor = parseInt(valorA)||1000;
        if (!racaA||!dificuldadeA) return message.reply('❌ Use: `c!missao <cacador/oni> <dificuldade> <qtd> <valor_ienes> <sucesso=true/false> @users`');
        const players = message.mentions.users;
        if (!players.size) return message.reply('❌ Mencione os jogadores da missão.');
        const xpGanho = Math.floor(valor*0.1);
        players.forEach(u => {
            const p = getPlayer(u.id);
            p.ienes=(p.ienes||0)+valor;
            p.maestria=(p.maestria||0)+xpGanho;
            if (sucessoA!=='false') p.kills=(p.kills||0)+parseInt(qtdA)||1;
            savePlayer(u.id, p);
        });
        return message.reply(`✅ Missão processada!\n> Jogadores: ${players.map(u=>`<@${u.id}>`).join(', ')}\n> 💴 +${valor.toLocaleString()} Ienes\n> ✨ +${xpGanho} XP de Maestria\n> 💀 ${sucessoA!=='false'?`+${qtd} kill(s)`:'+0 kills'}`);
    }

    // ==========================================
    // 🔗 COMMAND: c!addlaco / c!removelaco
    // ==========================================
    if (command === 'addlaco' || command === 'removelaco') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const tipo = args[0]?.toLowerCase();
        const users = message.mentions.users;
        if (!tipo||!['amizade','rivalidade','dupla'].includes(tipo)||users.size<2)
            return message.reply('❌ Use: `c!addlaco <amizade/rivalidade/dupla> @u1 @u2`');
        const [id1,id2] = [...users.keys()];
        const p1=getPlayer(id1), p2=getPlayer(id2);
        p1.lacos=p1.lacos||{amizade:[],rivalidade:[],dupla:null};
        p2.lacos=p2.lacos||{amizade:[],rivalidade:[],dupla:null};
        if (command==='addlaco') {
            if (tipo==='dupla') { p1.lacos.dupla=id2; p2.lacos.dupla=id1; }
            else { if(!p1.lacos[tipo].includes(id2)) p1.lacos[tipo].push(id2); if(!p2.lacos[tipo].includes(id1)) p2.lacos[tipo].push(id1); }
        } else {
            if (tipo==='dupla') { p1.lacos.dupla=null; p2.lacos.dupla=null; }
            else { p1.lacos[tipo]=p1.lacos[tipo].filter(i=>i!==id2); p2.lacos[tipo]=p2.lacos[tipo].filter(i=>i!==id1); }
        }
        savePlayer(id1,p1); savePlayer(id2,p2);
        return message.reply(`✅ Laço de **${tipo}** ${command==='addlaco'?'criado':'removido'} entre <@${id1}> e <@${id2}>.`);
    }

    // ==========================================
    // 🏥 COMMAND: c!setcoma / c!tirarcoma
    // ==========================================
    if (command === 'setcoma') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const dias = parseInt(args[1])||1;
        if (!alvo) return message.reply('❌ Use: `c!setcoma @user <dias>`');
        const player = getPlayer(alvo.id);
        const fim = Date.now()+dias*86400000;
        player.coma={ inicio:Date.now(), fim, dias };
        comaAtivo.set(alvo.id, fim);
        savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> entrou em coma por **${dias} dia(s)**. Acorda em \`${new Date(fim).toLocaleString('pt-BR')}\`.`);
    }
    if (command === 'tirarcoma') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!tirarcoma @user`');
        const player = getPlayer(alvo.id);
        delete player.coma; comaAtivo.delete(alvo.id); savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> foi retirado do coma.`);
    }

    // ==========================================
    // 🔄 COMMAND: c!resetm
    // ==========================================
    if (command === 'resetm') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!resetm @user`');
        const player = getPlayer(alvo.id); player.cooldowns={}; savePlayer(alvo.id, player);
        return message.reply(`✅ Cooldowns de <@${alvo.id}> resetados.`);
    }

    // ==========================================
    // 🌸 COMMAND: c!settsuguko
    // ==========================================
    if (command === 'settsuguko') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const mestre = args[1];
        if (!alvo||!mestre) return message.reply('❌ Use: `c!settsuguko @user <mestre>`');
        const player = getPlayer(alvo.id);
        player.tsuguko = mestre; player.isTsuguko = true;
        savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> é agora o **Tsuguko** de **${mestre}**!`);
    }

    // ==========================================
    // 💫 COMMAND: c!sethashira
    // ==========================================
    if (command === 'sethashira') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const posicao = args[0]?.toLowerCase();
        const alvo = message.mentions.users.first();
        if (!posicao) return message.reply('❌ Use: `c!sethashira <posicao> @user` ou `c!sethashira <posicao> vazio`');
        const h = loadHashiras();
        if (args[1]==='vazio') { delete h[posicao]; }
        else if (alvo) { h[posicao] = { id:alvo.id, nome:alvo.username }; }
        saveHashiras(h);
        return message.reply(`✅ Painel dos Hashiras atualizado — posição **${posicao}** ${alvo?`= <@${alvo.id}>`:' esvaziada'}.`);
    }

    // ==========================================
    // 🌅 COMMAND: c!setaprendiz / c!removeraprendiz
    // ==========================================
    if (command === 'setaprendiz') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const tipo = args[0]?.toLowerCase(); const slot = args[1];
        const alvo = message.mentions.users.first();
        if (!tipo||!slot||!alvo||!['solar','lunar'].includes(tipo)||!['slot1','slot2'].includes(slot))
            return message.reply('❌ Use: `c!setaprendiz <solar/lunar> <slot1/slot2> @user`');
        const ap = loadAprendizes();
        ap[tipo]=ap[tipo]||{}; ap[tipo][slot]=alvo.id;
        saveAprendizes(ap);
        return message.reply(`✅ <@${alvo.id}> definido como aprendiz **${tipo}** no ${slot}.`);
    }
    if (command === 'removeraprendiz') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const tipo = args[0]?.toLowerCase(); const slot = args[1];
        if (!tipo||!slot) return message.reply('❌ Use: `c!removeraprendiz <solar/lunar> <slot1/slot2>`');
        const ap = loadAprendizes();
        if (ap[tipo]) { delete ap[tipo][slot]; } saveAprendizes(ap);
        return message.reply(`✅ Slot **${slot}** de **${tipo}** esvaziado.`);
    }

    // ==========================================
    // ☀️ COMMAND: c!setliderkamado
    // ==========================================
    if (command === 'setliderkamado') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!setliderkamado @user`');
        const player = getPlayer(alvo.id);
        player.liderKamado = true;
        savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> é agora o **Líder Kamado — Herdeiro do Sol**!`);
    }

    // ==========================================
    // 🩷 COMMAND: c!carmesim / c!tirarcarmesim
    // ==========================================
    if (command === 'carmesim') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const nivel = parseInt(args[1])||1;
        if (!alvo||![1,2,3].includes(nivel)) return message.reply('❌ Use: `c!carmesim @user <1/2/3>`');
        const player = getPlayer(alvo.id); player.carmesim=nivel; savePlayer(alvo.id, player);
        const bonus = nivel*35;
        return message.reply(`✅ **Lâmina Carmesim Nível ${nivel}** ativada para <@${alvo.id}> (+${bonus}% dano).`);
    }
    if (command === 'tirarcarmesim') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!tirarcarmesim @user`');
        const player = getPlayer(alvo.id); delete player.carmesim; savePlayer(alvo.id, player);
        return message.reply(`✅ Carmesim removido de <@${alvo.id}>.`);
    }

    // ==========================================
    // ⚔️ COMMAND: c!validarbatalha / c!vitoriabatalha
    // ==========================================
    if (command === 'validarbatalha') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const users = message.mentions.users;
        if (users.size<2) return message.reply('❌ Use: `c!validarbatalha @u1 @u2`');
        const [id1,id2] = [...users.keys()];
        return message.reply(`⚔️ **Batalha de Sangue validada!**\n<@${id1}> vs <@${id2}>\n\nA luta pode começar. Use \`c!vitoriabatalha @vencedor @perdedor\` para processar o resultado.`);
    }
    if (command === 'vitoriabatalha') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const venc = message.mentions.users.first();
        const perd = [...message.mentions.users.values()][1];
        if (!venc||!perd) return message.reply('❌ Use: `c!vitoriabatalha @vencedor @perdedor`');
        const pvenc = getPlayer(venc.id); const pperd = getPlayer(perd.id);
        pvenc.kills=(pvenc.kills||0)+1;
        savePlayer(venc.id, pvenc); savePlayer(perd.id, pperd);
        return message.reply(`🏆 **${venc.username}** venceu a Batalha de Sangue contra **${perd.username}**!\n\nTroque os cargos manualmente no servidor e registre no painel dos Hashiras com \`c!sethashira\`.`);
    }

    // ==========================================
    // 🔓 COMMAND: c!setonilivre / c!sethibrido
    // ==========================================
    if (command === 'setonilivre') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!setonilivre @user`');
        const player = getPlayer(alvo.id); player.oniLivre=true; savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> agora é um **Oni Livre** — pode evoluir dormindo!`);
    }
    if (command === 'sethibrido') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!sethibrido @user`');
        const chance = Math.random();
        const player = getPlayer(alvo.id);
        if (chance<0.6) {
            player.hibrido=true; player.raca='hibrido';
            savePlayer(alvo.id, player);
            return message.reply(`✅ <@${alvo.id}> sobreviveu à transformação e agora é um **Híbrido Imortal**!`);
        } else {
            player.kills = Math.max(0,(player.kills||0)-5);
            savePlayer(alvo.id, player);
            return message.reply(`💀 <@${alvo.id}> **não sobreviveu** à transformação. O corpo rejeitou o sangue. -5 kills.`);
        }
    }

    // ==========================================
    // 🩸 COMMAND: c!setkekki / c!resetkekki
    // ==========================================
    if (command === 'setkekki') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const nome = args.slice(1).join(' ');
        if (!alvo||!nome) return message.reply('❌ Use: `c!setkekki @user <nome>`');
        const player = getPlayer(alvo.id); player.kekkijutsu=nome; savePlayer(alvo.id, player);
        return message.reply(`✅ Kekkijutsu de <@${alvo.id}> definido para \`${nome}\`.`);
    }
    if (command === 'resetkekki') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!resetkekki @user`');
        const player = getPlayer(alvo.id); player.kekkijutsu=null; savePlayer(alvo.id, player);
        return message.reply(`✅ Kekkijutsu de <@${alvo.id}> removido.`);
    }

    // ==========================================
    // ✅ COMMAND: c!aprovarselecao
    // ==========================================
    if (command === 'aprovarselecao') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!aprovarselecao @user`');
        const geral = loadGeral();
        geral.selecao = (geral.selecao||[]).filter(id=>id!==alvo.id);
        saveGeral(geral);
        const player = getPlayer(alvo.id);
        player.aprovado = true; player.dataAprovacao = new Date().toISOString();
        savePlayer(alvo.id, player);
        return message.reply(`✅ <@${alvo.id}> foi **aprovado na Seleção Final** e agora é um Caçador oficial! Atribua o cargo manualmente.`);
    }

    // ==========================================
    // 🗑️ COMMAND: c!limparselecao
    // ==========================================
    if (command === 'limparselecao') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const geral = loadGeral(); geral.selecao=[]; saveGeral(geral);
        return message.reply('✅ Fila da Seleção Final limpa.');
    }

    // ==========================================
    // 🤖 COMMAND: c!ativarboneco / c!yoriichi / c!vencerboneco
    // ==========================================
    if (command === 'ativarboneco' || command === 'yoriichi') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const embed = new EmbedBuilder().setColor('#FF6600')
            .setTitle('🤖 BONECO DE TREINO DE SEIS BRAÇOS — ATIVO')
            .setDescription('*O boneco de seis braços de Urokodaki foi ativado. Os participantes podem treinar agora.*\n\nUse `c!vencerboneco @user` para registrar a vitória.')
            .setTimestamp();
        bonecoAtivo.set(message.guild.id, true);
        return message.reply({ embeds:[embed] });
    }
    if (command === 'vencerboneco') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!vencerboneco @user`');
        const player = getPlayer(alvo.id);
        ['forca','resistencia','velocidade','reflexo'].forEach(s=>{ player[s]=(Number(player[s])||0)+2000; });
        player.folego=(Number(player.folego)||0)+10000;
        bonecoAtivo.delete(message.guild.id);
        savePlayer(alvo.id, player);
        return message.reply(`🏆 <@${alvo.id}> **derrotou o boneco de treino!**\n+2.000 em cada status ┋ +10.000 Fôlego`);
    }

    // ==========================================
    // 🎁 COMMAND: c!addcode / c!delcode
    // ==========================================
    if (command === 'addcode') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const nome = args[0]; const tipo = args[1]; const valor = parseInt(args[2])||0;
        if (!nome||!tipo) return message.reply('❌ Use: `c!addcode <nome> <ienes/kcoins> <valor>`');
        const codes = loadCodes();
        codes[nome] = { ienes:tipo==='ienes'?valor:0, kcoins:tipo==='kcoins'?valor:0, maxUsos:100, usos:0 };
        saveCodes(codes);
        return message.reply(`✅ Código \`${nome}\` criado com ${valor} ${tipo}.`);
    }
    if (command === 'delcode') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const nome = args[0];
        if (!nome) return message.reply('❌ Use: `c!delcode <nome>`');
        const codes = loadCodes(); delete codes[nome]; saveCodes(codes);
        return message.reply(`✅ Código \`${nome}\` removido.`);
    }

    // ==========================================
    // 💎 COMMAND: c!addkcoins
    // ==========================================
    if (command === 'addkcoins') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first(); const qtd = parseInt(args[1]);
        if (!alvo||isNaN(qtd)) return message.reply('❌ Use: `c!addkcoins @user <qtd>`');
        const player = getPlayer(alvo.id); player.kcoins=(player.kcoins||0)+qtd; savePlayer(alvo.id, player);
        return message.reply(`✅ **+${qtd} Kcoins** adicionados para <@${alvo.id}>. Total: \`${player.kcoins}\`.`);
    }

    // ==========================================
    // 🔧 COMMAND: c!fixrolls
    // ==========================================
    if (command === 'fixrolls') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const data = loadPlayers(); let corrigidos = 0;
        Object.entries(data).forEach(([id,p]) => {
            if (!p.rolls) { p.rolls={}; corrigidos++; }
            TODOS_ROLLS.forEach(r=>{ if (typeof p.rolls[r] !== 'number') { p.rolls[r]=0; corrigidos++; } });
            if (!p.cooldowns) p.cooldowns={};
            if (!p.lacos) p.lacos={amizade:[],rivalidade:[],dupla:null};
            if (!p.inventario) p.inventario={};
        });
        savePlayers(data);
        return message.reply(`✅ Inventários corrigidos. **${corrigidos}** campos normalizados.`);
    }

    // ==========================================
    // 🩺 COMMAND: c!debug
    // ==========================================
    if (command === 'debug') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const arquivos = ['players.json','titles.json','geral.json','hashiras.json','codes.json','aprendizes.json'];
        const linhas = arquivos.map(f => {
            try {
                const raw = fs.readFileSync(`./${f}`,'utf8');
                const parsed = JSON.parse(raw);
                const keys = Object.keys(parsed).length;
                const kb = (Buffer.byteLength(raw,'utf8')/1024).toFixed(1);
                return `> ✅ \`${f}\` — ${keys} registros — ${kb} KB`;
            } catch(e) { return `> ❌ \`${f}\` — ERRO: ${e.message}`; }
        });
        const embed = new EmbedBuilder().setColor('#2ECC71').setTitle('🩺 SAÚDE DOS ARQUIVOS JSON')
            .setDescription(linhas.join('\n')).setTimestamp();
        return message.reply({ embeds:[embed] });
    }

    // ==========================================
    // 🗑️ COMMAND: c!reset
    // ==========================================
    if (command === 'reset') {
        if (!isAdmin(message.member)) return message.reply('❌ Sem permissão.');
        const alvo = message.mentions.users.first();
        if (!alvo) return message.reply('❌ Use: `c!reset @user`');
        const data = loadPlayers(); delete data[alvo.id]; savePlayers(data);
        return message.reply(`✅ Dados de <@${alvo.id}> excluídos. A conta foi resetada.`);
    }

    // ==========================================
    // ☠️ COMMAND: c!resetall (APENAS DONO)
    // ==========================================
    if (command === 'resetall') {
        if (message.author.id !== message.guild?.ownerId) return message.reply('❌ Apenas o **dono do servidor** pode usar este comando.');
        savePlayers({}); saveTitles({}); saveGeral({ selecao:[] }); saveHashiras({}); saveCodes({}); saveAprendizes({});
        return message.reply('☠️ **RESET TOTAL EXECUTADO.** Todos os dados do servidor foram apagados.');
    }

    // ==========================================
    // 👹 COMMAND: c!npc
    // ==========================================
    if (command === 'npc') {
        const nomeNPC = args.join(' ');
        if (!nomeNPC) return message.reply('❌ Use: `c!npc <nome>`');
        const npcs = {
            'Muzan Kibutsuji': { titulo:'👑 Rei Oni — Progenitor dos Demônios', forca:12700, resistencia:12800, velocidade:12600, reflexo:12500, folego:35000, cor:'#8B0000' },
            'Yoriichi Tsugikuni': { titulo:'🌅 O Guerreiro Mais Poderoso da História', forca:2700, resistencia:2500, velocidade:2600, reflexo:2800, folego:27000, cor:'#FF6600' },
            'Kokushibo': { titulo:'🌕 Lua Superior 1 — Irmão de Yoriichi', forca:2800, resistencia:2700, velocidade:2200, reflexo:2300, folego:25000, cor:'#9B59B6' }
        };
        const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        const npc = Object.entries(npcs).find(([n])=>normalizar(n).includes(normalizar(nomeNPC)));
        if (!npc) return message.reply(`❌ NPC \`${nomeNPC}\` não encontrado.`);
        const [nome, dados] = npc;
        const embed = new EmbedBuilder().setColor(dados.cor||'#2b2d31')
            .setTitle(`⛩️ FICHA DE NPC: ${nome.toUpperCase()}`)
            .setDescription(`*${dados.titulo}*`)
            .addFields([
                { name:'⚔️ STATUS', value:`💥 Força: \`${dados.forca.toLocaleString()}\`\n🛡️ Resistência: \`${dados.resistencia.toLocaleString()}\`\n💨 Velocidade: \`${dados.velocidade.toLocaleString()}\`\n👁️ Reflexo: \`${dados.reflexo.toLocaleString()}\`\n🏮 Fôlego: \`${dados.folego.toLocaleString()}\``, inline:false }
            ]).setTimestamp();
        return message.reply({ embeds:[embed] });
    }
});

// ==========================================
// 🎛️ INTERAÇÕES (SELECT MENUS)
// ==========================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'select_forma') {
        const player = getPlayer(interaction.user.id);
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        const estiloAtivo = pegarRespiracaoPorCargo(member);
        const formas = formasDados[estiloAtivo];
        if (!formas) return interaction.reply({ content:'❌ Grimório não encontrado.', ephemeral:true });
        const idx = parseInt(interaction.values[0].replace('forma_',''));
        const forma = formas[idx];
        if (!forma) return interaction.reply({ content:'❌ Forma inválida.', ephemeral:true });
        const embed = new EmbedBuilder().setColor('#FF6B35')
            .setTitle(`⚔️ ${forma.nome}`)
            .setDescription(`*${forma.descricao}*`)
            .addFields([
                { name:'💥 Bônus de Força', value:`+\`${forma.forca.toLocaleString()}\``, inline:true },
                { name:'🎯 Nível de Dano', value:`\`${forma.dano}\``, inline:true }
            ]).setTimestamp();
        return interaction.reply({ embeds:[embed], ephemeral:true });
    }

    if (interaction.customId === 'select_kekki') {
        const player = getPlayer(interaction.user.id);
        const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        let listaEncontrada = null;
        for (const [key, lista] of Object.entries(kekkiDados)) {
            if (normalizar(player.kekkijutsu||'').includes(normalizar(key))) { listaEncontrada=lista; break; }
        }
        if (!listaEncontrada) return interaction.reply({ content:'❌ Grimório não encontrado.', ephemeral:true });
        const idx = parseInt(interaction.values[0].replace('kekki_',''));
        const tecnica = listaEncontrada[idx];
        if (!tecnica) return interaction.reply({ content:'❌ Técnica inválida.', ephemeral:true });
        const embed = new EmbedBuilder().setColor('#8B0000')
            .setTitle(`🩸 ${tecnica.nome}`)
            .setDescription(`*${tecnica.descricao}*`)
            .addFields([
                { name:'💥 Bônus de Força', value:`+\`${tecnica.forca.toLocaleString()}\``, inline:true },
                { name:'🎯 Nível de Dano', value:`\`${tecnica.dano}\``, inline:true }
            ]).setTimestamp();
        return interaction.reply({ embeds:[embed], ephemeral:true });
    }
});

async function main() {
  garantirArquivosDados();
  iniciarHealthServer();
  iniciarAutosave();
  const token = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN;
  if (!token) {
    throw new Error('Defina DISCORD_TOKEN ou BOT_TOKEN no ambiente.');
  }
  await client.login(token);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
