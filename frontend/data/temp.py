
fn = "maize"
un = []
with open(fn+".txt") as f:
	for line in f:
		l = line.split(",")
		if(l[1] != "\n"):
			un+=[l]

print(un)				
with open(fn+"_t.txt", "a") as w:
	for k in un:
		# print(k)
		w.write(",".join(k))