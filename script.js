document.getElementById('processFilesBtn').addEventListener('click', function () {
    const files = document.getElementById('file-input').files;
    const fileAreas = document.getElementById('file-areas');
    const globalContactName = document.getElementById('globalContactNameInput').value.trim();
    const downloadZipBtn = document.getElementById('downloadZipBtn');

    fileAreas.innerHTML = '';
    downloadZipBtn.style.display = 'block'; // Tampilkan tombol ZIP setelah proses file

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const textArea = document.createElement('textarea');
            textArea.classList.add('small-textarea');
            textArea.value = e.target.result;

            const fileNameInput = document.createElement('input');
            fileNameInput.type = 'text';
            fileNameInput.placeholder = 'Masukkan nama file VCF';
            fileNameInput.classList.add('file-name-input');

            const fileNameLabel = document.createElement('label');
            fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
            fileNameLabel.classList.add('file-name-label');

            const generateButton = document.createElement('button');
            generateButton.textContent = 'Generate VCF';
            generateButton.classList.add('generate-vcf-btn');
            generateButton.addEventListener('click', () => {
                const lines = textArea.value.split('\n').map(line => line.trim());
                const filename = (fileNameInput.value.trim() || file.name.replace(/\.[^/.]+$/, '')).replace(/[^a-zA-Z0-9-_]/g, '_');
                const contactName = globalContactName || filename;

                let vcfContent = '';
                let contactIndex = 1;

                lines.forEach(line => {
                    if (line) {
                        let phoneNumber = line;
                        if (!phoneNumber.startsWith('+')) {
                            phoneNumber = '+' + phoneNumber;
                        }
                        vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${contactIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;
                        contactIndex++;
                    }
                });

                if (vcfContent) {
                    const blob = new Blob([vcfContent], { type: 'text/vcard' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.vcf`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            });

            fileAreas.appendChild(fileNameLabel);
            fileAreas.appendChild(fileNameInput);
            fileAreas.appendChild(textArea);
            fileAreas.appendChild(generateButton);
        };
        reader.readAsText(file);
    });
});

document.getElementById('downloadZipBtn').addEventListener('click', function () {
    const fileAreas = document.getElementById('file-areas');
    const blocks = fileAreas.querySelectorAll('.file-name-label');
    const textareas = fileAreas.querySelectorAll('textarea');
    const nameInputs = fileAreas.querySelectorAll('input[type="text"]');
    const globalContactName = document.getElementById('globalContactNameInput').value.trim();

    const zip = new JSZip();

    blocks.forEach((block, index) => {
        const originalFileName = block.textContent.replace('Nama File Asal: ', '').replace(/\.[^/.]+$/, '');
        const customFileName = (nameInputs[index].value.trim() || originalFileName).replace(/[^a-zA-Z0-9-_]/g, '_');
        const contactName = globalContactName || customFileName;
        const lines = textareas[index].value.split('\n').map(line => line.trim()).filter(line => line);

        let vcfContent = '';
        lines.forEach((line, i) => {
            let phone = line;
            if (!phone.startsWith('+')) phone = '+' + phone;
            vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${i + 1}\nTEL:${phone}\nEND:VCARD\n\n`;
        });

        zip.file(`${customFileName}.vcf`, vcfContent);
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'semua_kontak.zip';
        a.click();
        URL.revokeObjectURL(url);
    });
});
