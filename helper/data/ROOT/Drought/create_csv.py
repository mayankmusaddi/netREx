def create_csv(filename):
    f = open(filename+".txt","r")
    
    w = open(filename+".csv","w+")
    label = {}
    w.write("id,Label\n")
    lines = f.readlines()
    for idx,line in enumerate(lines):
        w.write(str(idx)+","+line)
        label[line.strip()] = idx
    f.close()
    w.close()

    f = open(filename+"_net.txt","r")
    w = open(filename+"_net.csv","w+")
    w.write("Source,Target,k,pcc\n")
    lines = f.readlines()
    for line in lines:
        atr = line.split()
        w.write(str(label[atr[0]])+","+str(label[atr[1]])+","+atr[2]+","+atr[3]+"\n")
    f.close()
    w.close()

def create_csv2(filename):
    f = open(filename+"_.csv","r")
    w = open(filename+".csv","w+")
    label = {}
    w.write("id,Label\n")
    lines = f.readlines()
    for idx,line in enumerate(lines):
        w.write(str(idx)+","+line)
        label[line.strip()] = idx
    f.close()
    w.close()

    f = open(filename+"_net.txt","r")
    w = open(filename+"_net.csv","w+")
    w.write("Source,Target,k,pcc\n")
    lines = f.readlines()
    for line in lines:
        atr = line.split()
        w.write(str(label[atr[0]])+","+str(label[atr[1]])+","+atr[2]+","+atr[3]+"\n")
    f.close()
    w.close()

if __name__=="__main__":
    # create_csv("black")
    create_csv2("drought")