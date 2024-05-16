FROM 838860823423.dkr.ecr.us-west-1.amazonaws.com/aft-beatbox:latest
ENV work_dir=/opt/beatbox
RUN rm -rf ${work_dir}/tests
COPY tests ${work_dir}/tests
COPY test_utils ${work_dir}/test_utils
COPY requirements-test.txt ${work_dir}/requirements-test.txt
RUN pip3 install -r ${work_dir}/requirements-test.txt
