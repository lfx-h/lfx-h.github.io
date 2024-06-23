document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopButton').addEventListener('click', stopRecording);

let mediaRecorder;
let audioChunks = [];

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorder.start();

            document.getElementById('recordButton').style.display = 'none';
            document.getElementById('stopButton').style.display = 'inline';
            document.getElementById('status').innerText = 'Recording...';

            audioChunks = [];
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];
                sendRecording(audioBlob);

                document.getElementById('recordButton').style.display = 'inline';
                document.getElementById('stopButton').style.display = 'none';
                document.getElementById('status').innerText = 'Processing...';
            };
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
}

function sendRecording(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    console.log('Sending recording...');

    fetch('https://d185-2a00-1028-8382-8baa-50ab-fab2-731a-8707.ngrok-free.app/submit/', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Received response:', response);
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Parsed response:', data);
        document.getElementById('responseTextbox').value = data.result;
        document.getElementById('status').innerText = 'Recording complete';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('status').innerText = 'Error occurred' + error;
    });
}
