def sort_exceptions(excs):
    exc_list = list(excs)
    sorted_excs = sorted(exc_list, key=lambda exc: exc.timestamp)
    return sorted_excs
