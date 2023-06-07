const idValidator = require('idcard');
const verifyBtn = document.getElementById('verifyBtn');
const infoBtn = document.getElementById('infoBtn');
const generateBtn = document.getElementById('generateBtn');
const constellationBtn = document.getElementById('constellationBtn');
const ageBtn = document.getElementById('ageBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const resultDiv = document.getElementById('result');
verifyBtn.addEventListener('click', function () {
    const idNumber = document.getElementById('idNumber').value;
    const isValid = idValidator.verify(idNumber);
    if (isValid) {
        resultDiv.textContent = '身份证合法';
    } else {
        resultDiv.textContent = '身份证不合法';
    }
});

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





constellationBtn.addEventListener('click', function () {
    const idNumber = document.getElementById('idNumber').value;
    const birthday = idValidator.info(idNumber).birthday;
    const constellation = idValidator.constellation(birthday);
    // console.log(constellation);
    resultDiv.textContent = "星座："+constellation;
});

ageBtn.addEventListener('click', function () {
    const idNumber = document.getElementById('idNumber').value;
    const birthday = idValidator.info(idNumber).birthday;
    const age = idValidator.getAge(birthday);
    resultDiv.textContent = "年龄："+age+"岁";
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

