FROM ubuntu:bionic
LABEL maintainer "Wei-Te Chen <weite.chen@rakuten.com>"

ARG PYTHON=python3
ARG PIP=pip3

USER root
WORKDIR /root

RUN apt-get update && apt-get install -y \
    ${PYTHON} \
    ${PYTHON}-pip

RUN ${PIP} --no-cache-dir install --upgrade \
    pip \
    setuptools


COPY . /root/anafora
# RUN ${PIP} install $(find dist/ -type f -name \*.whl)[cpu]
RUN cd /root/anafora; ${PIP} install -r requirements.txt

COPY gunicorn.conf /root/gunicorn.conf

EXPOSE 55688
# ENTRYPOINT ["/usr/local/bin/ipa_backend"]
CMD ["gunicorn", "--config=gunicorn.conf", "prediction.app:app"]
