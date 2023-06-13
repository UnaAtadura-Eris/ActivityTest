const idValidator = require('idcard');
const infoBtn = document.getElementById('infoBtn');
const generateBtn = document.getElementById('generateBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const resultDiv = document.getElementById('result');

infoBtn.addEventListener('click', function () {
    const idNumber = document.getElementById('idNumber').value;
    const info = idValidator.info(idNumber);
    if (info.gender=="F") {
        info.gender="女"
    } else {
        info.gender="男"
    }
    info.valid ? info.valid="身份证合法" : info.valid="身份证不合法";

    // console.log(info);
    // resultDiv.textContent = JSON.stringify(info, null, 2);
    resultDiv.innerHTML = "地址: " + info.address + "<br>" +
    "性别: " + info.gender + "<br>" +
    "生日: " + info.birthday + "<br>" +
    "年龄: " + info.age + "<br>" +
    "星座: " + info.constellation + "<br>" +
    "身份证类型: " + info.cardText + "<br>" +
    "合法性: " + info.valid;
    // console.log(info.birth);
});

generateBtn.addEventListener('click', function () {
    const idNumber = idValidator.generateIdcard();
    document.getElementById('idNumber').value = idNumber;
});

upgradeBtn.addEventListener('click', function () {
    const idNumber = document.getElementById('idNumber').value;
    var result = idValidator.upgrade15To18(idNumber);
    resultDiv.innerHTML = "code: " + result.code + "<br>" +
    "msg: " + result.msg + "<br>" +
    "card: " + result.card ;
    // resultDiv.textContent = idValidator.upgrade15To18(idNumber);
    // resultDiv.textContent = JSON.stringify(idValidator.upgrade15To18(idNumber), null, 2);
});

