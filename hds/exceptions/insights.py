import matplotlib.pyplot as plt
import io, re
import scipy.cluster.hierarchy as hcluster
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer


def _pre_process_tb(tb):
    tb = re.sub("[^A-Za-z]", " ", tb)
    return tb

def cluster_tracebacks(tbs):
    vectorizer = TfidfVectorizer(sublinear_tf=True)
    tb_strs = [_pre_process_tb(tb) for tb in tbs]

    tb_arr = vectorizer.fit_transform(tb_strs).toarray()
    clusters = hcluster.fclusterdata(tb_arr, 0.5, criterion="distance")
    return clusters

def create_traceback_groups(exc_dicts):
    tb_dict = defaultdict(lambda: {"count": 0, "example": None, "instances": []})
    tbs = [exc.get("traceback") if exc.get("traceback") else "No Traceback" for exc in exc_dicts]
    clusters = cluster_tracebacks(tbs)
    for exc, cluster in zip(exc_dicts, clusters):
        cluster_key = int(cluster)
        tb_dict[cluster_key]["count"] += 1
        tb_dict[cluster_key]["instances"].append({"id": exc["id"], "ts": str(exc["timestamp"]), "hostname": exc["report__report__data__sysmon_report__emu_info__agent_label"]})
        if not tb_dict[cluster_key]["example"]:
            tb_dict[cluster_key]["example"] = exc["traceback"]
    num_clusters = len(set(clusters))
    return {
        "breakdown": dict(tb_dict),
        "num_clusters": num_clusters,
    }

def create_bar_chart(brkdwn_dict):
    fig, ax = plt.subplots()
    keys = []
    counts = []
    for key, value in brkdwn_dict["breakdown"].items():
        keys.append(key)
        counts.append(value["count"])
    sorted_lists = sorted(zip(counts, keys), reverse=True, key=lambda x: x[0])
    counts, keys = zip(*sorted_lists)
    keys = [str(key) for key in keys]
    ax.bar(keys, counts)
    return fig
