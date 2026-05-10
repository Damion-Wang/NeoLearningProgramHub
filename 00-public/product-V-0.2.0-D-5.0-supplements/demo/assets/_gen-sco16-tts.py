"""
SCO 16 · Neo 总结升华 TTS 生成脚本
voice: zh-CN-YunxiNeural（亲切男声，适合老师定位）
output: assets/sco16-tts.mp3
"""
import asyncio
import edge_tts

# 4 句结构 · 与 lecture-app.js 中分句打字节奏对齐
TEXT = """这一节走完了。回头看，我们从赵工的"又来了"入手，识别出被动型员工的四大特征——拖延、表面服从、否定建议、情绪化。

然后通过刘姐的视频，把穿透防御拆成三步：不接情绪、具体化场景、最小行动。

最后升级到责任意识重构四步：澄清事实、提取小动作、放回大目标反馈、邀请下一步。

今天最重要的一个动作就够了——把"又来了"当钩子识别，然后不接、转场景。其他都是配料。下次面对赵工时，先做这一个。"""

VOICE_MALE = "zh-CN-YunxiNeural"
VOICE_FEMALE = "zh-CN-XiaoxiaoNeural"

async def gen(voice, output):
    communicate = edge_tts.Communicate(TEXT, voice, rate="-5%")
    await communicate.save(output)
    print(f"Generated: {output}")

async def main():
    await gen(VOICE_MALE, "sco16-tts-male.mp3")
    await gen(VOICE_FEMALE, "sco16-tts-female.mp3")

asyncio.run(main())
