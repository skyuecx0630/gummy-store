#!/bin/bash -eux

python3 -m pip install -r /home/ec2-user/app/requirements.txt
systemctl restart app.service
