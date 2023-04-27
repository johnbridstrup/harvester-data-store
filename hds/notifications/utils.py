def build_list_filter(request):
    """
    Builds the filter dictionary for the query.

    Django's filter function takes a set of kwargs using the django field
    lookup syntax. E.g. fieldname__lookup_value.

    Args:
        request (HttpRequest): The request that is initializing the query

    Returns:
        dict: dictionary of query params and values
    """
    listfilter = {}

    # get harv_ids from query_params
    if "harv_ids" in request.query_params:
        harv_ids = request.query_params["harv_ids"].split(",")
        if len(harv_ids) > 0:
            listfilter["harvester__harv_id__in"] = harv_ids

    # get locations from query_params
    if "locations" in request.query_params:
        locations = request.query_params["locations"].split(",")
        if len(locations) > 0:
            listfilter["location__ranch"] = locations

    # get fruits from query_params
    if "fruits" in request.query_params:
        fruits = request.query_params["fruits"].split(",")
        if len(fruits) > 0:
            listfilter["harvester__fruit__name__in"] = fruits

    # get exception codes from query_params
    if 'codes' in request.query_params:
        codes = request.query_params["codes"].split(",")
        if len(codes) > 0:
            listfilter['exceptions__code__code__in'] = codes

    # get traceback from query_params
    if 'traceback' in request.query_params:
        traceback = request.query_params["traceback"]
        listfilter['exceptions__traceback'] = traceback

    # get traceback from query_params
    if 'generic' in request.query_params:
        generic = request.query_params["generic"]
        for item in generic.split(','):
            try:
                key, value = item.split('=')
            except ValueError:
                pass
            listfilter[key.strip()] = value.strip()

    # get is_emulator from query params
    if 'is_emulator' in request.query_params:
        is_emulator = request.query_params['is_emulator'].lower() in ['1', 'true']
        listfilter['harvester__is_emulator'] = is_emulator

    # get handled from query params
    if 'handled' in request.query_params:
        handled = request.query_params['handled'].lower() in ['1', 'true']
        listfilter['exceptions__handled'] = handled

    # get primary exceptions flag
    if 'primary' in request.query_params:
        primary = request.query_params['primary'].lower() in ['1', 'true']
        listfilter['exceptions__primary'] = primary

    return listfilter
