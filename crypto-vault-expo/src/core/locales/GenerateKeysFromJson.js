const fs = require('fs');

const jsonFilePath = './langs/en.json';
const outputFilePath = './LanguageKey.ts';

const generateKeysFromJson = () => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        try {
            const jsonObject = JSON.parse(data);
            const jsObject = {};
            for (const key in jsonObject) {
                if (jsonObject.hasOwnProperty(key)) {
                    jsObject[key] = key;
                }
            }
            fs.writeFile(
                outputFilePath,
                `const LanguageKey = ${JSON.stringify(
                    jsObject,
                    null,
                    2,
                )};\nexport default LanguageKey;`,
                'utf8',
                error => {
                    if (error) {
                        console.error('Error writing the file:', error);
                    } else {
                        console.log('JavaScript file generated successfully!');
                    }
                },
            );
        } catch (ERR) {
            console.error('Error parsing JSON:', ERR);
        }
    });
};
generateKeysFromJson();
