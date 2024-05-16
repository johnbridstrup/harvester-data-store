# Utility function for roles in the harvjobs app


def whitelist(jobtypes):
    jobtypes = [jt.lower() for jt in jobtypes]

    def is_whitelisted(request, view):
        try:
            if request.data["jobtype"].lower() in jobtypes:
                return True
        except KeyError:
            return False
        return False

    return is_whitelisted
