package com.example.activitytest;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.View;

import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.TimePicker;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Handler;



import org.joda.time.DateTime;
import org.joda.time.Period;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.Interval;
import org.joda.time.Years;
import org.joda.time.Months;
import org.joda.time.Weeks;


import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;



public class TimeActivity extends AppCompatActivity {

    private Button calculateButton;
    private Spinner unitSpinner;
    private TextView resultTextView;
    private String[] units = {"全部", "周+天","年", "月", "天", "小时", "分钟", "秒" };
    private boolean[] unitSelections = {false, false, false, false, false, false, false, false};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_time);
        EditText startDateEditText = findViewById(R.id.startDateEditText);
        EditText startTimeEditText = findViewById(R.id.startTimeEditText);
        EditText endDateEditText = findViewById(R.id.endDateEditText);
        EditText endTimeEditText = findViewById(R.id.endTimeEditText);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
        String currentDate = dateFormat.format(new Date());
        String currentTime = timeFormat.format(new Date());
        startDateEditText.setText(currentDate);
        startTimeEditText.setText(currentTime);
        endDateEditText.setText(currentDate);
        endTimeEditText.setText(currentTime);
        calculateButton = findViewById(R.id.calculateButton);
        unitSpinner = findViewById(R.id.unitSpinner);
        resultTextView = findViewById(R.id.resultTextView);
        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime targetDateTime = formatter.parseDateTime("1995-12-19 11:23:24");
        TextView onlineTimeTextView = findViewById(R.id.onlineTimeTextView);
        Handler handler = new Handler();






        // 创建一个 Runnable 对象用于更新在线时间
        Runnable updateTimeRunnable = new Runnable() {
            @Override
            public void run() {
                onlineTimeTextView.setText(calculateAll(targetDateTime,DateTime.now()));
                // 每隔一秒更新一次
                handler.postDelayed(this, 1000);
            }
        };
        // 开始更新在线时间
        handler.post(updateTimeRunnable);


        startTimeEditText.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showTimePicker(startTimeEditText);
            }
        });

        endTimeEditText.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showTimePicker(endTimeEditText);
            }
        });

        startDateEditText.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showDatePicker(startDateEditText);
            }
        });

        endDateEditText.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showDatePicker(endDateEditText);
            }
        });

        // 设置单位下拉菜单的适配器
        ArrayAdapter<String> unitAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, units);
        unitAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        unitSpinner.setAdapter(unitAdapter);

        // 监听单位下拉菜单的选择事件
        unitSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                // 根据选择情况更新单位选择数组
                for (int i = 0; i < unitSelections.length; i++) {
                    unitSelections[i] = (i == position);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                // Do nothing
            }
        });

        calculateButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String CstartDate = startDateEditText.getText().toString();
                String CstartTime = startTimeEditText.getText().toString();
                String startTimeString = CstartDate + " " + CstartTime;
                String CendDate = endDateEditText.getText().toString();
                String CendTime = endTimeEditText.getText().toString();
                String endTimeString = CendDate + " " + CendTime;

                DateTimeFormatter format = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
                try {
                    DateTime startTime = format.parseDateTime(startTimeString);
                    DateTime endTime = format.parseDateTime(endTimeString);

                    Interval interval = new Interval(startTime, endTime);

                    long seconds = interval.toDuration().getStandardSeconds();
                    long minutes = interval.toDuration().getStandardMinutes();
                    long hours = interval.toDuration().getStandardHours();
                    long days = interval.toDuration().getStandardDays();

//                    long years = interval.toDuration().getMillis();
//                    long months = interval.toDuration().getMillis();
                    // 计算年数差异
                    Years years = Years.yearsBetween(startTime, endTime);
                    int yearDifference = years.getYears();

                    // 计算月数差异
                    Months months = Months.monthsBetween(startTime, endTime);
                    int monthDifference = months.getMonths();

                    // 计算周数差异
                    Weeks weeks = Weeks.weeksBetween(startTime, endTime);
                    int weekDifference = weeks.getWeeks();
//                    int days = period.getDays();
//                    int hours = period.getHours();
//                    int minutes = period.getMinutes();
//                    int seconds = period.getSeconds();


                    StringBuilder resultBuilder = new StringBuilder();
                    for (int i = 0; i < unitSelections.length; i++) {
                        if (unitSelections[i]) {
                            switch (i) {
                                case 0: // 全部
//                                    if (seconds > 0) {
                                    resultBuilder.append(calculateAll(startTime,endTime));
//                                    }
                                    break;
                                case 1: // 周+天
//                                    if (seconds > 0) {
//                                    resultBuilder.append(weekDifference).append("周 ");
                                    resultBuilder.append(weekDifference).append("周").append(days%7).append("天");
//                                    }
                                    break;
                                case 2: // 年
//                                    if (years > 0) {
                                        resultBuilder.append(yearDifference).append("年 ");
//                                    }
                                    break;
                                case 3: // 月
//                                    if (months > 0) {
                                        resultBuilder.append(monthDifference).append("月 ");
//                                    }
                                    break;
                                case 4: // 天
//                                    if (days > 0) {
                                        resultBuilder.append(days).append("天 ");
//                                    }
                                    break;
                                case 5: // 小时
//                                    if (hours > 0) {
                                        resultBuilder.append(hours).append("小时 ");
//                                    }
                                    break;
                                case 6: // 分钟
//                                    if (minutes > 0) {
                                        resultBuilder.append(minutes).append("分钟 ");
//                                    }
                                    break;
                                case 7: // 秒
//                                    if (seconds > 0) {
                                        resultBuilder.append(seconds).append("秒 ");
//                                    }
                                    break;
                            }
                        }
                    }

                    String result = resultBuilder.toString().trim();
                    resultTextView.setText(result);

                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
//                    Toast.makeText(MainActivity.this, "时间格式错误", Toast.LENGTH_SHORT).show();
                    String errorMessage = "时间格式错误或起止时间颠倒";
                    resultTextView.setText(errorMessage);
                }
            }
        });



    }








    private void showDatePicker(final EditText editText) {
        final Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog datePickerDialog = new DatePickerDialog(TimeActivity.this, new DatePickerDialog.OnDateSetListener() {
            @Override
            public void onDateSet(DatePicker view, int year, int monthOfYear, int dayOfMonth) {
                // 更新日期选择框的文本
                calendar.set(Calendar.YEAR, year);
                calendar.set(Calendar.MONTH, monthOfYear);
                calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);

                SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                String date = format.format(calendar.getTime());
                editText.setText(date);

//                updateDateTimeEditText(); // 更新日期和时间合并框的文本
            }
        }, year, month, day);
        datePickerDialog.show();
    }

    private void showTimePicker(final EditText editText) {
        final Calendar calendar = Calendar.getInstance();
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        int minute = calendar.get(Calendar.MINUTE);

        TimePickerDialog timePickerDialog = new TimePickerDialog(TimeActivity.this, new TimePickerDialog.OnTimeSetListener() {
            @Override
            public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                // 更新时间选择框的文本
                calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                calendar.set(Calendar.MINUTE, minute);

                SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
                String time = format.format(calendar.getTime());
                editText.setText(time);

//                updateDateTimeEditText(); // 更新日期和时间合并框的文本
            }
        }, hour, minute, true);
        timePickerDialog.show();
    }
        public static String calculateAll(DateTime startTime, DateTime endTime) {
            // 获取差异的年、月、日、小时、分钟和秒
            Period period = new Period(startTime, endTime);
            int Pyears = period.getYears();
            int Pmonths = period.getMonths();
            int Pweeks = period.getWeeks();
            int Pdays = period.getDays();
            int Phours = period.getHours();
            int Pminutes = period.getMinutes();
            int Pseconds = period.getSeconds();
            // 拼接差异结果
            String all = Pyears + "年" + Pmonths + "月" + Pweeks + "周"+ Pdays + "天" + Phours + "小时" + Pminutes + "分钟" + Pseconds + "秒";
            return all;
        }
}




/*
    TextView onlineTimeTextView = findViewById(R.id.onlineTimeTextView);
    SimpleDateFormat timeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
    long startTime = "1995-12-19 11:23:24";

// 创建计时器并设置计时器任务
   Timer timer = new Timer();
       timer.scheduleAtFixedRate(new TimerTask() {
        @Override
        public void run() {
            updateOnlineTime();
        }
    }, 0, 1000); // 每秒更新一次

*/


