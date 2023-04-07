def build_list_filter(request):
        """Builds the filter dictionary for the query.

        Django's filter function takes a set of kwargs using the django field
        lookup syntax. E.g. fieldname__lookup_value.

        Args:
            request (HttpRequest): The request that is initializing the query

        Returns:
            dict: dictionary of query params and values
        """
        listfilter = {}

        # get exception codes fromrequest and filter queryset for exception code
        if 'codes' in request.query_params:
            codes = request.query_params["codes"].split(",")
            if len(codes) > 0:
                listfilter['exceptions__code__code__in'] = codes

        # Primary exceptions flag
        if 'exceptions__primary' in request.query_params:
            primary = request.query_params['exceptions__primary'].lower() in ['1', 'true']
            listfilter['exceptions__primary'] = primary

        return listfilter
