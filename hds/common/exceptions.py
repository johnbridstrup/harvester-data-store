# HDS specific exceptions


class HDSException(Exception):
    pass


class FeatureNotEnabled(HDSException):
    pass
