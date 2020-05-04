import csv

def create_csv(node_fn, attr_fns,flag=0):
    print(node_fn)
    # Read Node Table
    f = open(node_fn+".txt","r")
    ds = {}
    lines = f.readlines()
    for idx,line in enumerate(lines):
        label = line.strip()
        ds[label] = {}
        ds[label]['id'] = idx
        ds[label]['Label'] = label
    f.close()

    # Read/Write Edge Table
    f = open(node_fn+"_net.txt","r")
    w = open(node_fn+"_net.csv","w+")
    if flag:
        w.write("Source,Target,k\n")
    else:
        w.write("Source,Target,k,pcc\n")
    lines = f.readlines()
    for line in lines:
        atr = line.split()
        if flag:
            w.write(str(ds[atr[0]]['id'])+","+str(ds[atr[1]]['id'])+","+atr[2]+"\n")
        else:
            w.write(str(ds[atr[0]]['id'])+","+str(ds[atr[1]]['id'])+","+atr[2]+","+atr[3]+"\n")
    f.close()
    w.close()

    # Read Attribute Table
    titles = ['id','Label']
    for filename in attr_fns:
        print(">>",filename)
        with open(filename, 'r') as csvfile:
            csvreader = csv.reader(csvfile)

            titles_fn = next(csvreader)
            num_attr = len(titles_fn)

            titles.extend(titles_fn[1:])

            for row in csvreader:
                label = row[0].strip()
                if label in ds.keys():
                    for i in range(1,num_attr):
                        fd = row[i].strip()
                        if fd == "NA":
                            fd = ""
                        ds[label][titles_fn[i]] = fd

    print(titles)
    rows = list(ds.values())

    write_fn = node_fn+"_full.csv"
    with open(write_fn, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames = titles)
        writer.writeheader()
        writer.writerows(rows)

if __name__=="__main__":
    stress = ['ABA','cold','drought','flood','JA','osmo']

    data = "./data/"

    root = data+"ROOT/"
    root_networks = root+"networks/"
    rootmod_networks = root+"high_degree_module_hrr/"

    for st in stress:
        create_csv( root_networks+st ,[ data+"TF_annotations.csv",data+"kegg_gene_info.csv", root+"k_total_root.csv", root+"Root_cluster_degree.csv", root+"Root_gene_annotations.csv", root_networks+st+"_DEGs.csv"])

    modules = ['black','blue','brown','cyan','green','greenyellow','grey60','lightcyan','lightyellow','lightgreen','Magenta','midnightblue','pink','purple','red','royalblue','salmon','tan','turquoise','yellow']
    for md in modules:
        create_csv( rootmod_networks+md, [ data+"TF_annotations.csv",data+"kegg_gene_info.csv", root+"k_total_root.csv", root+"Root_cluster_degree.csv", root+"Root_gene_annotations.csv"])

    print("ROOT COMPLETED")

    shoot = data+"SHOOT/"
    shoot_networks = shoot+"networks/"
    shootmod_networks = shoot+"high_degree_module_hrr/"

    for st in stress:
        create_csv( shoot_networks+st ,[ data+"TF_annotations.csv",data+"kegg_gene_info.csv", shoot+"k_total_shoot.csv", shoot+"Shoot_cluster_degree.csv", shoot+"Shoot_gene_annotations.csv", shoot_networks+st+"_DEGs.csv"])

    modules = ['black','blue','brown','cyan','green','greenyellow','grey60','lightcyan','lightgreen','magenta','midnightblue','pink','purple','red','salmon','tan','turquoise','yellow']
    for md in modules:
        create_csv( shootmod_networks+md, [ data+"TF_annotations.csv",data+"kegg_gene_info.csv", shoot+"k_total_shoot.csv", shoot+"Shoot_cluster_degree.csv", shoot+"Shoot_gene_annotations.csv"], flag=1)

    print("SHOOT COMPLETED")