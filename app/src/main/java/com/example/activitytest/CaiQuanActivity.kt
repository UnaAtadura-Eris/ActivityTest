package com.example.activitytest

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.Switch
import android.widget.Toast

class CaiQuanActivity : AppCompatActivity() {
    private lateinit var imageView: ImageView
    private lateinit var imageView2: ImageView
    private lateinit var button: Button
    private lateinit var button2: Button
    private lateinit var switch: Switch
    private lateinit var switch2: Switch


    private val images = listOf(R.drawable.scissors, R.drawable.rock, R.drawable.paper)
    private var isAnimatingImageView = false
    private var isAnimatingImageView2 = false
    private var currentIndexImageView = 0
    private var currentIndexImageView2 = 0
    private val handler = Handler()
    private val animationRunnable = Runnable { animateImages() }
    private val animationRunnable2 = Runnable { animateImagesForImageView2() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cai_quan)
        imageView = findViewById(R.id.imageView)
        imageView2 = findViewById(R.id.imageView2)
        button =findViewById(R.id.Button_reverse)
        button2 =findViewById(R.id.Button_reverse2)
        switch=findViewById(R.id.Switch_Cheat)
        switch2=findViewById(R.id.Switch_Cheat2)
        imageView.setOnClickListener {
            if (isAnimatingImageView) {
                stopAnimationForImageView()
                if (switch.isChecked) {
                    if (!isAnimatingImageView2){
                        if (currentIndexImageView2<2){
                            imageView.setImageResource(images[currentIndexImageView2+1])
                        }else{
                            imageView.setImageResource(images[0])
                        }
                    }
                } else if(switch2.isChecked) {
                    if (!isAnimatingImageView2) {
                        if (currentIndexImageView2 > 0) {
                            imageView.setImageResource(images[currentIndexImageView2 - 1])
                        } else {
                            imageView.setImageResource(images[2])
                        }
                    }
                }

            } else {
                startAnimationForImageView()
            }
        }



        imageView2.setOnClickListener {
            if (isAnimatingImageView2) {
                stopAnimationForImageView2()
                    if (switch2.isChecked) {
                        if (!isAnimatingImageView){
                            if (currentIndexImageView<2){
                            imageView2.setImageResource(images[currentIndexImageView+1])
                            }else{
                                imageView2.setImageResource(images[0])
                            }

                        }

                    } else if(switch.isChecked) {
                        if (!isAnimatingImageView){
                        if (currentIndexImageView>0){
                            imageView2.setImageResource(images[currentIndexImageView-1])
                        }else{
                            imageView2.setImageResource(images[2])
                        }
                        }
                    }
            } else {
                startAnimationForImageView2()
            }
        }
        button2.setOnClickListener{
//            Toast.makeText(this, "button2", Toast.LENGTH_SHORT).show()
            button.isEnabled = true
            switch.isEnabled = true
            button2.isEnabled = false
            switch2.isChecked = false
            switch2.isEnabled = false
        }
        button.setOnClickListener{
//            Toast.makeText(this, "button2", Toast.LENGTH_SHORT).show()
            button2.isEnabled = true
            switch2.isEnabled = true
            button.isEnabled = false
            switch.isChecked = false
            switch.isEnabled = false
        }
    }

    private fun startAnimationForImageView() {
        isAnimatingImageView = true
        currentIndexImageView = 0
        animateImages()
    }

    private fun startAnimationForImageView2() {
        isAnimatingImageView2 = true
        currentIndexImageView2 = 0
        animateImagesForImageView2()
    }

    private fun stopAnimationForImageView() {
        isAnimatingImageView = false
        handler.removeCallbacks(animationRunnable)
    }

    private fun stopAnimationForImageView2() {
        isAnimatingImageView2 = false
        handler.removeCallbacks(animationRunnable2)
    }

    private fun animateImages() {
        if (isAnimatingImageView) {
            currentIndexImageView = (currentIndexImageView + 1) % images.size

            val matrix = Matrix()
            matrix.setScale(1f, -1f) // 设置矩阵的 Y 轴缩放为 -1，实现倒置显示

            val originalBitmap = BitmapFactory.decodeResource(resources, images[currentIndexImageView])
            val invertedBitmap = Bitmap.createBitmap(originalBitmap, 0, 0, originalBitmap.width, originalBitmap.height, matrix, true)

            imageView.setImageBitmap(invertedBitmap)
        }
        handler.postDelayed(animationRunnable, 10)
    }


    private fun animateImagesForImageView2() {
        if (isAnimatingImageView2) {
            currentIndexImageView2 = (currentIndexImageView2 + 1) % images.size
            imageView2.setImageResource(images[currentIndexImageView2])

        }
        handler.postDelayed(animationRunnable2, 10)
    }
}
