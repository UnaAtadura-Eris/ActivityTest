package com.example.activitytest

// MainActivity.kt
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity

class RulerActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_ruler)
        val editText = findViewById<EditText>(R.id.EditText)
        val rulerView = findViewById<RulerView>(R.id.rulerView)
        val updateButton = findViewById<Button>(R.id.updateButton)

        rulerView.setEditText(editText)
        rulerView.setUpdateButton(updateButton)
    }

}
