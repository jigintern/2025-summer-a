# 参考: https://qiita.com/morlock/items/4ea144038c5392a72d8b

from fontTools.ttLib import TTFont

# msgothic.ttcを何かしらの方法でttfに分解して, mspgothicが入っているttfを生成し, そのパスに置き変えてください
font = TTFont("mspgothic.ttf")

cmap = font['cmap'].getcmap(3,10)
points = list(map(lambda x: x[0], cmap.cmap.items()))
points.sort()
ranges = []
lstart = -2
last = -2
for point in points:
    # - ASCII制御文字
    # - U+2028 "Line separator"
    # - U+2029 "Paragraph separator"
    # - サロゲートペア領域
    # を扱いが面倒なので無視
    if point <= 0x1f or point == 0x2028 or point == 0x2029 or point >= 0x10000:
        continue
    if last + 1 != point:
        if lstart == last:
            ranges.append(lstart)
        else:
            ranges.append([lstart, last])
        lstart = point
    last = point
if lstart == last:
    ranges.append(lstart)
else:
    ranges.append([lstart, last])
# 手法的に先頭に混じるダミー区間を削除して出力
print(ranges[1:])
