"ui";
/**
 * @Description: AutoX.js 华医网自动学习考试脚本（UI版）
 * @version: 2.0.0
 * @Author: UnaAtadura
 * @Date: 2026.03.17
 */

// ==============================================
// 配置
// ==============================================
const 题库文件路径 = files.path("./考试题库.json");
let 题库 = 读取题库();
let 上一题文字 = "";
let 当前选项字母 = "A";
let 考试次数 = 0;
const 最大考试次数 = 5;
const UserName = "李家祥";

// ==============================================
// 悬浮窗相关
// ==============================================
var floatyWindow = null;
var logText = "";

function createFloatWindow() {
    if (floatyWindow) return;

    floatyWindow = floaty.rawWindow(
        <frame bg="#AA000000" gravity="left" padding="8">
            <vertical>
                <text id="title" text="日志输出（长按可滑动）" textColor="#FFFFFF" textSize="14sp" />
                <scroll id="scroll" w="*" h="200">
                    <text id="log" text="等待日志..." textColor="#FFFFFF" textSize="12sp" />
                </scroll>
                <button id="closeBtn" text="关闭" w="*" h="40" />
            </vertical>
        </frame>
    );


    // 默认开启点击穿透
    floatyWindow.setTouchable(false);
    
    floatyWindow.setPosition(0, 0);
    floatyWindow.setSize(device.width, 300);

    // 长按标题切换可滑动/穿透
    var longPressTimer;
    floatyWindow.title.setOnTouchListener(function (view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                // 按下1秒后，关闭穿透，允许滑动
                longPressTimer = setTimeout(() => {
                    floatyWindow.setTouchable(true);
                }, 1000);
                return true;
            case event.ACTION_UP:
            case event.ACTION_CANCEL:
                // 松开手，恢复穿透
                clearTimeout(longPressTimer);
                floatyWindow.setTouchable(false);
                return true;
        }
        return false;
    });

    // 关闭按钮
    floatyWindow.closeBtn.on("click", function () {
        floatyWindow.close();
        floatyWindow = null;
    });

    logText = "";
}

// 更新悬浮窗日志
function appendLog(msg) {
    logText += msg + "\n";
    if (logText.length > 5000) {
        logText = logText.slice(-5000); // 限制长度
    }
    if (floatyWindow) {
        ui.run(() => {
            floatyWindow.log.setText(logText);
            // 自动滚动到底部
            floatyWindow.log.getParent().scrollTo(0, floatyWindow.log.getHeight());
        });
    }
}

// 关闭悬浮窗
function closeFloatWindow() {
    if (floatyWindow) {
        floatyWindow.close();
        floatyWindow = null;
    }
}

// 重写 log 函数，同时输出到控制台和悬浮窗
const originalLog = log;
log = function(msg) {
    originalLog(msg);
    appendLog(String(msg));
};

// ==============================================
// 工具函数
// ==============================================

function timeToSeconds(timeStr) {
    if (!timeStr || timeStr.indexOf(":") === -1) return 0;
    let parts = timeStr.split(":").map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function 下一个字母(c) {
    switch (c) {
        case "A": return "B";
        case "B": return "C";
        case "C": return "D";
        case "D": return "E";
        default: return "A";
    }
}

// ==============================================
// 题库相关函数（与之前相同）
// ==============================================

function 读取题库() {
    try {
        if (files.exists(题库文件路径)) {
            return JSON.parse(files.read(题库文件路径));
        }
    } catch (e) {}
    return {};
}

function 保存题库() {
    try {
        files.write(题库文件路径, JSON.stringify(题库, null, 2));
    } catch (e) {
        log("保存题库失败：" + e);
    }
}

function 获取正确选项(题目) {
    return 题库[题目] || null;
}

function 点击选项(字母) {
    let 选项列表 = id("com.huayi.cme:id/rl_cheack_item_quest_single_top").find();
    for (let i = 0; i < 选项列表.length; i++) {
        let 父布局 = 选项列表[i];
        let 文字控件 = 父布局.findOne(id("com.huayi.cme:id/tv_item_quest_single_zimu"));
        if (文字控件 && 文字控件.text().trim().startsWith(字母)) {
            父布局.click();
            sleep(200);
            return true;
        }
    }
    log(`⚠️ 未找到字母为 ${字母} 的选项`);
    return false;
}

function 清洗题目(str) {
    str = str.split("【")[0].trim();
    str = str.replace(/^(单选|多选|判断)?\s*\d+[、.\s]+/i, "").trim();
    return str;
}

function 提取答案字母(str) {
    let m = str.match(/【您的答案：([A-E])/);
    return m ? m[1] : null;
}

function 识别对错并更新题库() {
    sleep(1000);
    let screen = captureScreen();
    let resultIcons = id("iv_item_test_result_weitongguo").find();

    if (resultIcons.length === 0) {
        log("未找到结果图标");
        screen.recycle();
        return;
    }

    for (let i = 0; i < resultIcons.length; i++) {
        let icon = resultIcons[i];
        let bounds = icon.bounds();
        let hasGreen = false;
        let hasRed = false;

        for (let x = bounds.left; x < bounds.right; x++) {
            for (let y = bounds.top; y < bounds.bottom; y++) {
                let color = images.pixel(screen, x, y);
                let r = colors.red(color);
                let g = colors.green(color);
                let b = colors.blue(color);

                if (g > r + 40 && g > b + 40) {
                    hasGreen = true;
                    x = 9999;
                    y = 9999;
                    break;
                }
                if (r > g + 40 && r > b + 40) {
                    hasRed = true;
                    x = 9999;
                    y = 9999;
                    break;
                }
            }
        }

        let 题目区域 = icon.parent().findOne(id("tv_item_title"));
        if (!题目区域) continue;
        let 完整题目 = 题目区域.text().trim();
        let 正确选项 = 提取答案字母(完整题目);

        if (hasGreen && 正确选项) {
            let 纯题干 = 清洗题目(完整题目);
            题库[纯题干] = 正确选项;
            log(`📚 记录新题：${纯题干} -> ${正确选项}`);
        }
    }

    保存题库();
    screen.recycle();
    log("✅ 题库更新完成");
}

// ==============================================
// 考试相关函数（与之前相同）
// ==============================================

function 开始做题() {
    while (true) {
        sleep(300);
        let 题目控件 = id("com.huayi.cme:id/tv_quest_single_title").findOne(2500);
        if (!题目控件) {
            log("未找到题目，结束本轮");
            break;
        }

        let 当前题目Raw = 题目控件.text().trim();
        log("原始题目：" + 当前题目Raw);

        let 当前题目 = 清洗题目(当前题目Raw);
        log("清洗后题干：" + 当前题目);

        if (当前题目 === 上一题文字) {
            log("题目无变化 → 交卷");
            let 交卷按钮 = id("com.huayi.cme:id/tv_answer_question_jiaojuan").findOne(2000);
            if (交卷按钮) {
                交卷按钮.click();
                sleep(2000);
            }
            break;
        }
        上一题文字 = 当前题目;

        let 正确选项 = 获取正确选项(当前题目);
        if (正确选项) {
            log("题库存在 → 选：" + 正确选项);
            点击选项(正确选项);
        } else {
            log("题库无题 → 选：" + 当前选项字母);
            点击选项(当前选项字母);
        }

        sleep(800);
        let 下一题按钮 = id("com.huayi.cme:id/btn_nextquestions").findOne(3000);
        if (下一题按钮) 下一题按钮.click();
    }
}

function do_test() {
    考试次数 = 0;
    while (考试次数 < 最大考试次数) {
        考试次数++;
        log("开始第 " + 考试次数 + " 次考试");
        开始做题();

        sleep(2000);
        let 未通过 = textContains("考试未通过").findOne(5000);

        if (!未通过) {
            log("✅ 第" + 考试次数 + "次考试通过！");
            let 完成按钮 = id("com.huayi.cme:id/btn_test_result_left").findOne(3000);
            if (完成按钮) 完成按钮.click();
            break;
        }

        if (考试次数 >= 最大考试次数) {
            log("已达到最大考试次数(" + 最大考试次数 + "次)，停止");
            return;
        }

        log("❌ 未通过，收集正确答案...");
        识别对错并更新题库();

        log("🔄 准备重考");
        let 重考按钮 = id("com.huayi.cme:id/btn_test_result_right").findOne(3000);
        if (重考按钮) {
            重考按钮.click();
            sleep(3500);
        }

        当前选项字母 = 下一个字母(当前选项字母);
        log("下次默认选：" + 当前选项字母);
        上一题文字 = "";
    }
}

function test_card() {
    let targetList = textMatches(/.*待考试.*/).find();
    if (targetList.length === 0) {
        log("没有需要考试的课程");
        return;
    }

    log("找到 " + targetList.length + " 个考试");
    sleep(1500);

    for (let i = 0; i < targetList.length; i++) {
        let view = targetList[i];
        let card = null;
        let temp = view;

        for (let k = 0; k < 8; k++) {
            if (!temp) break;
            if (temp.id() === "com.huayi.cme:id/rl_item_course_detail") {
                card = temp;
                break;
            }
            temp = temp.parent();
        }

        if (!card) {
            log("第" + (i + 1) + "个：找不到考试卡片，跳过");
            continue;
        }

        log("打开第 " + (i + 1) + " 个考试");
        card.click();
        sleep(2000);
        if (id("rl_video_kaoshi").exists()) {
            id("rl_video_kaoshi").click();
        }
        log("开始考试...");
        do_test();

        back();
        sleep(2500);

        targetList = textMatches(/.*待考试.*/).find();
    }

    log("全部考试处理完成！");
}

function auto_test() {
    const courseId = "com.huayi.cme:id/ll_mylike_course";
    let courses = id(courseId).find();
    if (courses.length === 0) {
        log("未找到任何课程");
        return;
    }
    log("找到 " + courses.length + " 个课程");

    for (let i = 0; i < courses.length; i++) {
        log("正在打开第 " + (i + 1) + " 个课程");
        courses[i].click();
        sleep(2000);

        let hasTest = textContains("待考试").exists() || descContains("待考试").exists();

        if (hasTest) {
            log("✅ 该课程未考试，不返回");
            test_card();
        } else {
            log("✅ 该课程已考试完毕，返回");
            back();
            sleep(1000);
        }

        courses = id(courseId).find();
    }

    log("✅ 所有课程检查完成");
}

// ==============================================
// 视频学习相关函数（与之前相同）
// ==============================================

function showTimeText() {
    try {
        let node = id("com.huayi.cme:id/rl_play").findOne(200);
        if (node) {
            let bounds = node.bounds();
            let x = (bounds.left + bounds.right) * 9 / 10;
            let y = (bounds.top + bounds.bottom) / 2;
            click(x, y);
            log("通过控件坐标点击成功，弹出进度条");
        }
        sleep(1000);
    } catch (e) {
        log("❌ 点击失败：" + e);
        sleep(300);
        click(device.width * 7 / 10, device.height / 5);
    }
}

function handleClassThinking() {
    if (!textContains("课堂思考").exists()) {
        log("✅ 无课堂思考");
        return;
    }

    log("🔍 发现课堂思考，开始自动答题...");
    const QUESTION_ITEM_ID = "com.huayi.cme:id/rl_cheack_item_quest_single_top";
    const SUBMIT_BTN_ID = "com.huayi.cme:id/btn_middle_question_comit";
    const MAX_TRY = 5;
    let tryCount = 0;

    while (textContains("课堂思考").exists() && tryCount < MAX_TRY) {
        tryCount++;
        log(`\n===== 第 ${tryCount} 次尝试 =====`);

        let options = id(QUESTION_ITEM_ID).find();
        if (options.length < 2) {
            log("⚠️ 选项不足2个，无法切换，退出");
            return;
        }

        let selectIndex = tryCount % 2 === 1 ? 0 : 1;
        options[selectIndex].click();
        log(`📝 已选择第 ${selectIndex + 1} 个选项`);
        sleep(300);

        id(SUBMIT_BTN_ID).click();
        log("✅ 已提交答案");
        sleep(1000);

        if (!textContains("课堂思考").exists()) {
            log(`🎉 答题成功！共尝试 ${tryCount} 次`);
            let confirm = id("com.huayi.cme:id/btnAlertDialogConfirm").findOne(3000);
            if (confirm) confirm.click();
            return;
        }

        log(`❌ 答案错误，继续尝试...`);
    }

    log("⚠️ 已达到最大尝试次数（5次），停止答题");
}

function play_video() {
    const MAX_WAIT_SECONDS = 4000;
    let startTime = new Date().getTime();
    let lastPercent = 0;

    while (true) {
        try {
            let now = new Date().getTime();
            let costSeconds = (now - startTime) / 1000;
            if (costSeconds >= MAX_WAIT_SECONDS) {
                log("⏰ 等待超时，自动退出");
                back();
                break;
            }
            log(`⏱ 已等待 ${Math.floor(costSeconds)} 秒`);

            if (text("当前为移动网络，是否继续播放？").exists()) {
                log("✅ 检测到：当前为移动网络，自动点击继续");
                id("android:id/button1").click();
            }
            handleClassThinking();
            showTimeText();

            if (text("本课件已学习完毕").exists()) {
                log("✅ 检测到：本课件已学习完毕");
                id("com.huayi.cme:id/btn_test_result_left").click();
                log("✅ 返回上一页");
                break;
            }
            if (text("请点击左下角“考试”按钮参加课后测试").exists()) {
                log("✅ 检测到考试提示");
                id("com.huayi.cme:id/btnAlertDialogConfirm").click();
                sleep(500);
                back();
                break;
            }

            let playDuration = id("com.huayi.cme:id/playDuration").findOne(2000);
            let videoDuration = id("com.huayi.cme:id/videoDuration").findOne(2000);
            if (!playDuration || !videoDuration) {
                log("⚠️ 未找到时间文本，继续等待...");
                sleep(2000);
                continue;
            }

            let playText = playDuration.text();
            let videoText = videoDuration.text();
            let playSec = timeToSeconds(playText);
            let videoSec = timeToSeconds(videoText);

            if (videoSec <= 0) {
                sleep(2000);
                continue;
            }

            let percent = playSec / videoSec;
            log(`当前进度：${(percent * 100).toFixed(2)}% (${playText}/${videoText})`);

            if (lastPercent > 0 && percent < lastPercent) {
                log("✅ 检测到进度倒退，视频已播放完毕");
                back();
                break;
            }

            if (percent >= 0.999 || playSec >= videoSec) {
                log("✅ 视频即将播放完成，等待10秒后退出");
                sleep(10000);
                if (text("本课件已学习完毕").exists()) {
                    id("com.huayi.cme:id/btn_test_result_left").click();
                } else {
                    back();
                }
                break;
            }

            lastPercent = percent;

        } catch (e) {
            log("⚠️ 异常，继续运行：" + e);
        }
        sleep(10000);
    }
}

function study_card() {
    let targetList = textMatches(/.*(未学习|播放至).*/).find();
    if (targetList.length === 0) {
        log("没有需要学习的课程");
        return;
    }

    log("找到 " + targetList.length + " 个未完成课程");
    sleep(1500);

    for (let i = 0; i < targetList.length; i++) {
        let view = targetList[i];
        let card = null;
        let temp = view;

        for (let k = 0; k < 8; k++) {
            if (!temp) break;
            if (temp.id() === "com.huayi.cme:id/rl_item_course_detail") {
                card = temp;
                break;
            }
            temp = temp.parent();
        }

        if (!card) {
            log("第" + (i + 1) + "个：找不到课程卡片，跳过");
            continue;
        }

        log("打开第 " + (i + 1) + " 个课程");
        card.click();
        sleep(3000);

        log("开始学习...");
        play_video();

        back();
        sleep(2500);

        targetList = textMatches(/.*(未学习|播放至).*/).find();
    }

    log("全部课程处理完成！");
}

function auto_study() {
    const courseId = "com.huayi.cme:id/ll_mylike_course";
    let courses = id(courseId).find();
    if (courses.length === 0) {
        log("未找到任何课程");
        return;
    }
    log("找到 " + courses.length + " 个课程");

    for (let i = 0; i < courses.length; i++) {
        log("正在打开第 " + (i + 1) + " 个课程");
        courses[i].click();
        sleep(2000);

        let hasUnstudy = textContains("未学习").exists() || descContains("未学习").exists();
        let hasPlaying = textContains("播放至").exists() || descContains("播放至").exists();

        if (hasUnstudy || hasPlaying) {
            log("✅ 该课程未学习/未完成，不返回");
            study_card();
        } else {
            log("✅ 该课程已学习完毕，返回");
            back();
            sleep(1000);
        }

        courses = id(courseId).find();
    }

    log("✅ 所有课程检查完成");
}

// ==============================================
// 导航与权限（调整以适应UI）
// ==============================================

function ScreenCapture() {
    setScreenMetrics(1080, 1920);
    if (!requestScreenCapture()) {
        toast("截图权限被拒绝，脚本退出");
        exit();
    }
    log("截图权限获取成功");
    sleep(1000);
}

function start_app() {
    log("正在启动掌上华医...");
    if (!launchApp("掌上华医")) {
        toast("找不到掌上华医，请确认已安装");
        return false;
    }
    sleep(5000);
    // 等待主页出现
    for (let i = 0; i < 5; i++) {
        if (id("iv_home_sys").exists()) {
            log("发现主页");
            break;
        }
        back();
        sleep(500);
        log("第" + (i + 1) + "次尝试");
    }
    if (!id("iv_home_sys").exists()) {
        toast("5次未找到主页，请手动进入收藏页面");
        return false;
    }

    // 导航到“我的”
    if (className("android.widget.TextView").text("我的").exists()) {
        log("找到我的");
        className("android.widget.TextView").text("我的").findOne().parent().parent().click();
    } else {
        toast("未找到“我的”按钮");
        return false;
    }
    
    if (className("android.widget.TextView").text("我的收藏").exists()) {
        log("找到我的收藏");
        YanZheng(); // 验证
        className("android.widget.TextView").text("我的收藏").findOne().parent().click();
    } else {
        toast("未找到“我的收藏”");
        return false;
    }
    sleep(1500);
    return true;
}

function YanZheng() {
    let nickName = id("com.huayi.cme:id/tv_my_accoun_nikename").findOne(2000);
    let expireTime = new Date(2027, 2, 1);
    let now = new Date();

    if (nickName && nickName.text() !== UserName) {
        toast("用户名不是" + UserName + "，脚本停止");
        sleep(3000);
        engines.stopAll();
        exit();
    }

    if (now > expireTime) {
        toast("脚本已过期（2027-03-01），停止运行");
        sleep(3000);
        engines.stopAll();
        exit();
    }

    log("验证通过");
}

function 开始执行(){
    console.show();    
    log("开启静音");
    device.setMusicVolume(0);
}

function 结束执行(){
    log("运行结束，共耗时" + (parseInt(endTime - startTime)) / 1000 + "秒");
    log("恢复原来音量:" + originalVolume);
    device.setMusicVolume(originalVolume);
    threads.shutDownAll();
    console.hide();
    engines.stopAll();
}

// ==============================================
// UI 界面
// ==============================================

ui.layout(
    <vertical padding="16" bg="#FFF5F5F5">
        <text text="华医网自动学习考试系统" textSize="20sp" gravity="center" margin="8" textColor="#FF2196F3" />
        <text text="v2.0.1 (UI版)" textSize="14sp" gravity="center" marginBottom="16" textColor="#FF666666" />
        <button id="btn_study" text="📺 只看视频" style="Widget.AppCompat.Button.Colored" margin="8" />
        <button id="btn_exam" text="📝 只考试" style="Widget.AppCompat.Button.Colored" margin="8" />
        <button id="btn_both" text="🚀 先看视频再考试" style="Widget.AppCompat.Button.Colored" margin="8" />
        <button id="btn_help" text="❓ 使用说明" style="Widget.AppCompat.Button" margin="8" />
        <text id="txt_status" text="状态：等待操作" textSize="14sp" marginTop="16" textColor="#FF4CAF50" />
        <text text="作者联系方式：QQ 799890216" textSize="12sp" gravity="center" marginTop="16" textColor="#FF999999" />
    </vertical>
);

// 状态更新函数
function setStatus(msg) {
    ui.run(() => {
        ui.txt_status.setText("状态：" + msg);
    });
}

// 通用前置准备：截图权限
function prepare(readyCallback) {
    threads.start(function() {
        auto.waitFor();
        setStatus("请求截图权限...");
        ScreenCapture();       
        setStatus("✅ 准备就绪，开始任务...");
        if (readyCallback) readyCallback();
    });
}

// 按钮点击事件
ui.btn_study.click(() => {
    ui.btn_study.setEnabled(false);
    ui.btn_exam.setEnabled(false);
    ui.btn_both.setEnabled(false);
    setStatus("正在准备学习...");

    // 创建悬浮窗
    createFloatWindow();

    threads.start(function() {
        try {
            setStatus("请求截图权限...");
            ScreenCapture();

            setStatus("启动应用并导航...");
            if (!start_app()) {
                setStatus("❌ 导航失败，请手动进入收藏页面后重试");
                return;
            }

            setStatus("📺 开始学习视频...");
            auto_study();
            setStatus("✅ 学习任务完成");
        } finally {
            // 任务结束关闭悬浮窗
            closeFloatWindow();
            ui.run(() => {
                ui.btn_study.setEnabled(true);
                ui.btn_exam.setEnabled(true);
                ui.btn_both.setEnabled(true);
            });
        }
    });
});

ui.btn_exam.click(() => {
    ui.btn_study.setEnabled(false);
    ui.btn_exam.setEnabled(false);
    ui.btn_both.setEnabled(false);
    prepare(function() {
        setStatus("启动应用并导航...");
        if (!start_app()) {
            setStatus("❌ 导航失败，请手动进入收藏页面后重试");
            return;
        }
        auto_test();
        setStatus("✅ 考试任务完成");
        ui.run(() => {
            ui.btn_study.setEnabled(true);
            ui.btn_exam.setEnabled(true);
            ui.btn_both.setEnabled(true);
        });
    });
});

ui.btn_both.click(() => {
    ui.btn_study.setEnabled(false);
    ui.btn_exam.setEnabled(false);
    ui.btn_both.setEnabled(false);
    prepare(function() {
        setStatus("启动应用并导航...");
        if (!start_app()) {
            setStatus("❌ 导航失败，请手动进入收藏页面后重试");
            return;
        }
        auto_study();
        auto_test();
        setStatus("✅ 完整流程完成");
        ui.run(() => {
            ui.btn_study.setEnabled(true);
            ui.btn_exam.setEnabled(true);
            ui.btn_both.setEnabled(true);
        });
    });
});

ui.btn_help.click(() => {
    dialogs.alert(
        "使用说明",
        "1. 确保手机已开启无障碍服务（auto.waitFor 会自动请求）；\n" +
        "2. 脚本运行时会自动启动“掌上华医”并进入收藏页面；\n" +
        "3. 首次使用会请求截图权限，请允许；\n" +
        "4. 请确保收藏页面中有课程，否则会提示未找到；\n" +
        "5. 学习/考试过程中请勿操作手机；\n" +
        "6. 打开视频检测到当前为移动网络，会自动点击继续，请在WiFi环境下运行，避免浪费流量。；\n"+
        "7. 如需停止脚本请按‘音量上键’停止所有脚本；\n"+
        "8. 如有问题请联系作者 QQ：799890216。"
    );
});

// 脚本启动时先显示UI
setStatus("等待用户选择");