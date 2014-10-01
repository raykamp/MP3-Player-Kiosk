#!/bin/bash

# Find Flash Drive
DRIVEPATH=$(awk -v needle="/dev/sda1" '$1==needle {print $2}' /proc/mounts)
echo "Drive Location: $DRIVEPATH"

# Install the startup script
sudo cp $DRIVEPATH/Anoka.sh /etc/init.d/Anoka.sh
sudo chmod +x /etc/init.d/Anoka.sh

#Install Fonts
sudo cp $DRIVEPATH/FuturaStd-Medium.otf /usr/local/share/fonts/
fc-cache -fv

# append start script to startup profile
sudo bash -c "echo 'sudo /etc/init.d/Anoka.sh stop && sleep 60 && sudo /etc/init.d/Anoka.sh start &' >> /etc/profile"

#sudo update-rc.d Anoka.sh defaults
# sudo /etc/init.d/Anoka.sh start