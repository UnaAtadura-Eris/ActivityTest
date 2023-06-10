package com.example.activitytest

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View

class RulerView(context: Context, attrs: AttributeSet) : View(context, attrs) {

    private val scaleHeightLong = 120 // 长刻度线高度
    private val scaleHeightMedium = 80 // 中刻度线高度
    private val scaleHeightShort = 40 // 短刻度线高度
    private val scaleSpacing = 15.6f // 刻度间距
    private val scaleColor = Color.BLACK // 刻度颜色
    private val scaleWidth = 5f // 刻度宽度
    private val textSize = 30f // 文本字体大小

    private val paint = Paint()

    init {
        paint.color = scaleColor
        paint.strokeWidth = scaleWidth
        paint.textSize = textSize // 设置文本字体大小
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val width = width.toFloat()
        val height = height.toFloat()

        val startY = height * 0.01f // 刻度尺的起始Y坐标为控件高度的10%
        val endY = height * 0.99f // 刻度尺的结束Y坐标为控件高度的90%
        val centerX = scaleHeightLong + textSize // 刻度尺的X坐标为长刻度线高度和文本宽度

        var y = startY // 定义刻度的起始Y坐标为刻度尺的起始Y坐标
        var cm = 0 // 初始化厘米数为0
        var count = 0 // 计数器，用于判断当前是第几个刻度线

        while (y <= endY) {
            var scaleHeight = scaleHeightShort // 默认为短刻度线高度

            if (count % 10 == 0) {
                // 每隔10个刻度线用长刻度线
                scaleHeight = scaleHeightLong

                // 在长刻度线下标注厘米数
                val text = "$cm cm"
                val textWidth = paint.measureText(text)
                canvas.drawText(text, centerX + 10f, y + textSize + 10f, paint)
            } else if (count % 5 == 0) {
                // 每隔5个刻度线用中刻度线
                scaleHeight = scaleHeightMedium
            }

            canvas.drawLine(centerX, y, centerX - scaleHeight, y, paint) // 绘制刻度线

            y += scaleSpacing // 更新刻度的Y坐标，增加刻度间距
            count++ // 增加计数器

            if (count % 10 == 0) {
                // 每隔10个刻度线增加厘米数
                cm++
            }
        }
    }
}


