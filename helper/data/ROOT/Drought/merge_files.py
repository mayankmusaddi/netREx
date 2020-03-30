def merge_files(main_fn,attr_fns):

    ds = {}
    titles = []
    for filename in attr_fns:
        f = open(filename,"r")
        lines = f.readlines()
        
        titles_fn = lines[0].strip().split(',')
        titles_fn = list(map(str.strip, titles_fn))
        num_attr = len(titles_fn)
        print(titles_fn)

        titles.extend(titles_fn[1:])

        for idx,line in enumerate(lines):
            if idx == 0:
                continue

            fields = line.strip().split(',')
            fields = list(map(str.strip, fields))

            if fields[0] not in ds.keys():
                ds[fields[0]] = {}
            for i in range(1,num_attr):
                ds[fields[0]][titles_fn[i]] = fields[i]
        f.close()
    
    print("ALL: ",titles)
    for i,key in enumerate(ds):
        print(key,ds[key])
        if i==2:
            break

    f = open(main_fn,"r")
    w = open(main_fn.split('.')[0]+"_full."+main_fn.split('.')[1],"w+")

    lines = f.readlines()
    title = lines[0].strip()
    w.write("Gene,"+",".join(titles)+"\n")

    for idx,line in enumerate(lines):
        if idx == 0:
            continue

        gene = line.strip()
        w.write(gene)

        for title in titles:
            if title not in ds[gene].keys():
                w.write(", ")
            else:
                w.write(","+ds[gene][title])
        w.write("\n")

    f.close()
    w.close()

if __name__=="__main__":
    merge_files("drought.csv",["k_total_root.csv","TF_annotations.csv","Root_cluster_degree.csv","drought_fold.csv"])