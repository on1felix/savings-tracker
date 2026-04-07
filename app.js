import Peer from 'peerjs';

class FileTransfer {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.file = null;
        this.transferCode = null;
        this.isSender = false;
        this.chunks = [];
        this.receivedSize = 0;
        this.totalSize = 0;
        this.startTime = null;
        this.lastUpdate = null;
        this.lastBytes = 0;
        this.fileHandle = null;
        this.chunkSize = 16384; // 16KB chunks

        this.initializeUI();
    }

    initializeUI() {
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file
        document.getElementById('removeFile').addEventListener('click', () => {
            this.resetSender();
        });

        // Copy code
        document.getElementById('copyCode').addEventListener('click', () => {
            navigator.clipboard.writeText(this.transferCode);
            const btn = document.getElementById('copyCode');
            btn.textContent = 'Скопировано!';
            setTimeout(() => btn.textContent = 'Копировать', 2000);
        });

        // Receiver
        document.getElementById('connectBtn').addEventListener('click', () => {
            const code = document.getElementById('codeInput').value.trim();
            if (code.length === 6) {
                this.connectToSender(code);
            }
        });

        document.getElementById('codeInput').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        document.getElementById('acceptFile').addEventListener('click', () => {
            this.startReceiving();
        });

        // Reset buttons
        document.getElementById('sendAnother').addEventListener('click', () => {
            this.resetSender();
        });

        document.getElementById('receiveAnother').addEventListener('click', () => {
            this.resetReceiver();
        });
    }

    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.getElementById('send-tab').classList.toggle('hidden', tab !== 'send');
        document.getElementById('receive-tab').classList.toggle('hidden', tab !== 'receive');
    }

    handleFileSelect(file) {
        this.file = file;
        this.isSender = true;

        document.getElementById('uploadArea').classList.add('hidden');
        document.getElementById('fileInfo').classList.remove('hidden');
        document.getElementById('codeDisplay').classList.remove('hidden');

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatBytes(file.size);

        this.generateCode();
        this.setupSender();
    }

    generateCode() {
        this.transferCode = Math.floor(100000 + Math.random() * 900000).toString();
        document.getElementById('transferCode').textContent = this.transferCode;
    }

    async setupSender() {
        // Create PeerJS instance with the code as ID
        this.peer = new Peer('sender-' + this.transferCode, {
            host: '0.peerjs.com',
            port: 443,
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('Sender peer ID:', id);
        });

        this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.showSenderNotification('Получатель подключился!');

            conn.on('open', () => {
                console.log('Connection opened');
                this.sendFileMetadata();
            });

            conn.on('data', (data) => {
                if (data.type === 'ready') {
                    this.showSenderNotification('Получатель готов к приёму!');
                    document.getElementById('codeDisplay').classList.add('hidden');
                    document.getElementById('sendProgress').classList.remove('hidden');
                    this.startSending();
                } else if (data.type === 'progress') {
                    this.updateSendProgress(data.received, data.total);
                }
            });

            conn.on('error', (err) => {
                console.error('Connection error:', err);
            });
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            alert('Ошибка подключения: ' + err.message);
        });
    }

    async connectToSender(code) {
        this.transferCode = code;

        document.getElementById('codeInput').disabled = true;
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('connectBtn').textContent = 'Подключение...';

        // Create PeerJS instance
        this.peer = new Peer({
            host: '0.peerjs.com',
            port: 443,
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', () => {
            // Connect to sender
            this.connection = this.peer.connect('sender-' + code);

            this.connection.on('open', () => {
                console.log('Connected to sender');
            });

            this.connection.on('data', async (data) => {
                if (data.type === 'metadata') {
                    this.file = data;
                    document.getElementById('receiveFileName').textContent = data.name;
                    document.getElementById('receiveFileSize').textContent = this.formatBytes(data.size);
                    document.querySelector('.code-input-area').classList.add('hidden');
                    document.getElementById('filePreview').classList.remove('hidden');
                    this.totalSize = data.size;
                } else if (data.type === 'chunk') {
                    // Receiving file chunk
                    this.chunks.push(data.data);
                    this.receivedSize += data.data.byteLength;

                    this.updateReceiveProgress(this.receivedSize, this.totalSize);

                    // Send progress back to sender
                    this.connection.send({
                        type: 'progress',
                        received: this.receivedSize,
                        total: this.totalSize
                    });

                    if (this.receivedSize >= this.totalSize) {
                        await this.completeReceive();
                    }
                }
            });

            this.connection.on('error', (err) => {
                console.error('Connection error:', err);
                alert('Ошибка подключения к отправителю');
            });
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            alert('Не удалось подключиться. Проверьте код.');
        });
    }

    showSenderNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async startReceiving() {
        // Use File System Access API to choose save location
        try {
            const options = {
                suggestedName: this.file.name,
                types: [{
                    description: 'All Files',
                    accept: { '*/*': [] }
                }]
            };

            this.fileHandle = await window.showSaveFilePicker(options);

            document.getElementById('filePreview').classList.add('hidden');
            document.getElementById('receiveProgress').classList.remove('hidden');

            this.startTime = Date.now();
            this.lastUpdate = Date.now();
            this.receivedSize = 0;
            this.lastBytes = 0;
            this.chunks = [];

            // Notify sender that receiver is ready
            this.connection.send({ type: 'ready' });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting file location:', err);
                alert('Не удалось выбрать место сохранения файла');
            }
        }
    }

    sendFileMetadata() {
        const metadata = {
            type: 'metadata',
            name: this.file.name,
            size: this.file.size,
            mimeType: this.file.type
        };

        this.connection.send(metadata);
    }

    async startSending() {
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.lastBytes = 0;

        const reader = new FileReader();
        let offset = 0;

        const sendChunk = () => {
            const slice = this.file.slice(offset, offset + this.chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            if (this.connection && this.connection.open) {
                this.connection.send({
                    type: 'chunk',
                    data: e.target.result
                });
                offset += e.target.result.byteLength;

                if (offset < this.file.size) {
                    setTimeout(sendChunk, 10);
                } else {
                    this.completeSend();
                }
            }
        };

        sendChunk();
    }

    updateSendProgress(sent, total) {
        const progress = (sent / total) * 100;
        const now = Date.now();
        const timeDiff = (now - this.lastUpdate) / 1000;

        if (timeDiff >= 0.1) {
            const bytesDiff = sent - this.lastBytes;
            const speed = bytesDiff / timeDiff;

            document.getElementById('sendProgressFill').style.width = progress + '%';
            document.getElementById('sendPercent').textContent = Math.round(progress) + '%';
            document.getElementById('sendSpeed').textContent = this.formatBytes(speed) + '/s';
            document.getElementById('sendTransferred').textContent =
                `${this.formatBytes(sent)} / ${this.formatBytes(total)}`;

            const remaining = (total - sent) / speed;
            document.getElementById('sendRemaining').textContent = this.formatTime(remaining);

            this.lastUpdate = now;
            this.lastBytes = sent;
        }
    }

    updateReceiveProgress(received, total) {
        const progress = (received / total) * 100;
        const now = Date.now();
        const timeDiff = (now - this.lastUpdate) / 1000;

        if (timeDiff >= 0.1) {
            const bytesDiff = received - this.lastBytes;
            const speed = bytesDiff / timeDiff;

            document.getElementById('receiveProgressFill').style.width = progress + '%';
            document.getElementById('receivePercent').textContent = Math.round(progress) + '%';
            document.getElementById('receiveSpeed').textContent = this.formatBytes(speed) + '/s';
            document.getElementById('receiveTransferred').textContent =
                `${this.formatBytes(received)} / ${this.formatBytes(total)}`;

            const remaining = (total - received) / speed;
            document.getElementById('receiveRemaining').textContent = this.formatTime(remaining);

            this.lastUpdate = now;
            this.lastBytes = received;
        }
    }

    completeSend() {
        document.getElementById('sendProgress').classList.add('hidden');
        document.getElementById('sendSuccess').classList.remove('hidden');
    }

    async completeReceive() {
        document.getElementById('receiveProgress').classList.add('hidden');

        try {
            const writable = await this.fileHandle.createWritable();
            const blob = new Blob(this.chunks);
            await writable.write(blob);
            await writable.close();

            document.getElementById('receiveSuccess').classList.remove('hidden');
        } catch (err) {
            console.error('Error writing file:', err);
            alert('Ошибка при сохранении файла');
        }
    }

    resetSender() {
        this.file = null;
        this.transferCode = null;
        if (this.connection) this.connection.close();
        if (this.peer) this.peer.destroy();
        document.getElementById('uploadArea').classList.remove('hidden');
        document.getElementById('fileInfo').classList.add('hidden');
        document.getElementById('codeDisplay').classList.add('hidden');
        document.getElementById('sendProgress').classList.add('hidden');
        document.getElementById('sendSuccess').classList.add('hidden');
        document.getElementById('fileInput').value = '';
    }

    resetReceiver() {
        this.chunks = [];
        this.receivedSize = 0;
        this.totalSize = 0;
        if (this.connection) this.connection.close();
        if (this.peer) this.peer.destroy();
        document.querySelector('.code-input-area').classList.remove('hidden');
        document.getElementById('filePreview').classList.add('hidden');
        document.getElementById('receiveProgress').classList.add('hidden');
        document.getElementById('receiveSuccess').classList.add('hidden');
        document.getElementById('codeInput').value = '';
        document.getElementById('codeInput').disabled = false;
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('connectBtn').textContent = 'Подключиться';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileTransfer();
});
