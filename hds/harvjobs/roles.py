# Utility function for roles in the harvjobs app

def whitelist(jobtypes):
    jobtypes = [jt.lower() for jt in jobtypes]
    def is_whitelisted(request, view):
        if request.data["jobtype"].lower() in jobtypes:
            return True
        return False
    return is_whitelisted