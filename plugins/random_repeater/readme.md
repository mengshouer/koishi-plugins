# @mengshouer/koishi-plugin-random_repeater

[![npm](https://img.shields.io/npm/v/@mengshouer/koishi-plugin-random_repeater?style=flat-square)](https://www.npmjs.com/package/@mengshouer/koishi-plugin-random_repeater)

# 随机复读机

不复读率 随 复读次数 指数级衰减

从第2条复读，即第3条重复消息开始有几率触发复读

a 设为一个略大于1的小数，最好不要超过2，建议1.6

复读概率计算式：p_n = 1 - 1/a^n

递推式：p_n+1 = 1 - (1 - p_n) / a

## 安装

```bash
npm/yarn add @mengshouer/koishi-plugin-random_repeater
```


参考：https://github.com/Ice9Coffee/HoshinoBot/blob/master/hoshino/modules/groupmaster/random_repeater.py
