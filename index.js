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
