const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { useEffect } = require('react');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // 🔁 Exemplo de comandos simples
        if (text.toLowerCase() === "!oi") {
            await sock.sendMessage(from, { text: "Oi, tudo bem? 👋" });
        } else if (text.toLowerCase() === "!menu") {
            await sock.sendMessage(from, {
                text: "*Comandos disponíveis:*\n!oi – saudação\n!info – sobre o bot",
            });
        } else if (text.toLowerCase() === "!info") {
            await sock.sendMessage(from, {
                text: "Eu sou um bot pessoal feito com Baileys 🤖",
            });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot conectado!');
        }
    });
}

startBot();
