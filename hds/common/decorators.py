from django.views.decorators.cache import cache_page
from functools import wraps

def cache_page_if_qp_exist(timeout):
    """
    Decorator for caching response.

    This decorator extends the cache_page decorator to cache the response
    if query params exists.
    """
    def cache_wrapper(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # Check if query parameters exist in the request
            if request.GET:
                # If query parameters exist, cache the response
                return cache_page(timeout)(view_func)(request, *args, **kwargs)
            else:
                # If no query parameters, execute the view function without caching
                return view_func(request, *args, **kwargs)

        return _wrapped_view

    return cache_wrapper
