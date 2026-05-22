// 工具函数：向上寻找 【clickable=true】 的父控件
function findClickableParent(obj) {
    if (!obj) return null;
    
    let current = obj;
    // 最多向上找 20 层（足够深）
    for (let i = 0; i < 10; i++) {
        if (!current) break;
        
        // 判断：这个控件是否可点击
        if (current.clickable() === true) {
            return current;
        }
        
        // 不可点击就继续往上找
        current = current.parent();
    }
    return null;
}

// 智能文字点击：自动找可点击的父控件，不用传层数 n！
function 文字点击(wenzi) {
    // 查找文字控件
    let WZ = className("android.widget.TextView").text(wenzi).findOne();
    if (!WZ) {
        log("❌ 未找到文字：" + wenzi);
        return false;
    }

    // 自动找可点击的父控件
    let clickableObj = findClickableParent(WZ);
    if (!clickableObj) {
        log("❌ 找不到可点击的父控件：" + wenzi);
        return false;
    }

    // 找到就点击
    log("✅ 点击：" + wenzi);
    clickableObj.click();
    //sleep(1000);
    return true;
}

function 文字坐标点击(wenzi) {
    // 查找文字控件
    let WZ = className("android.widget.TextView").text(wenzi).findOne();
    
    if (!WZ) {
        log("❌ 未找到文字：" + wenzi);
        return false;
    }

    // 获取文字的坐标 → 直接点击中心点
    let rect = WZ.bounds();  // 获取控件位置
    let x = rect.centerX();  // 中心 X
    let y = rect.centerY();  // 中心 Y

    log("✅ 坐标点击：" + wenzi + "  (" + x + ", " + y + ")");
    click(x, y);  // 直接坐标点击
    //sleep(1000);
    return true;
}

// 启动微信 + 自动处理分身选择 + 进入我的 + 进入收藏
function start_app() {
    log("启动微信...");    
    // 启动微信
    if (!launchApp("微信")) {
        log("未安装微信");
        return false;
    }
    sleep(1000);

    if (文字坐标点击("微信")) {
        sleep(1000);
        log("✅ 微信启动完成");
        return true;
    }
}
    
function 进入编辑界面() {
    let homeLoaded = false;
    for (let i = 0; i < 8; i++) {
        if (id("com.tencent.mm:id/huj").exists()) {
            log("已进入微信主页");
            homeLoaded = true;
            break;
        }
        back();
        sleep(300);
    }
    if (!homeLoaded) {
        log("未进入微信主页，退出");
        return false;
    }
    if (!文字坐标点击("我")) return;
    if (!文字坐标点击("收藏")) return;
    if (!文字坐标点击("写传阅")) return;
    if (!文字坐标点击("邮件")) return;
    if (!文字坐标点击("发件箱")) return;
    if (!文字坐标点击("复制粘贴")) return;
    log("✅ 已进入编辑界面");
    return true;
}
// 功能：清空输入框 + 粘贴【手动复制】的文字 + 保存退出
function paste() {
    // 1. 找到输入框（排除文本包含"复制粘贴"的）
    sleep(500);
    let edits = className("android.widget.EditText").find();
    log("找到输入框数量：" + edits.length);
    let secondEdit = edits.length >= 2 ? edits.get(1) : null;
    if (!secondEdit) {
        log("未找到第二个输入框，尝试depth查找...");        
        secondEdit = className("android.widget.EditText").depth(23).findOne(3000);
    }
    // 还是null就退出，避免崩溃
    if (!secondEdit) {
        log("输入框未找到，退出");
        return false;
    }
    // 2. 激活输入框（必加，防止粘贴失效）
    secondEdit.click();
    // click(device.width / 2, device.height / 2);// 点击设备中点
    sleep(300);
    // 3. 清空原有内容
    secondEdit.setText("");
    sleep(300);
    // 4. 直接粘贴【你手机手动复制】的剪贴板内容（核心！）
    secondEdit.paste();
    sleep(300);
    log("粘贴完成");
    文字坐标点击("保 存");
    sleep(500);
    id("com.tencent.mm:id/actionbar_up_indicator").click();
    sleep(500);
    back();
    return true;
}



function main() {
    if (!start_app()) return;
    if (!进入编辑界面()) return;
    if (!paste()) return;
    log("🎉 全流程完成！");
}

auto.waitFor();
main()




