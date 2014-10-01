#!/bin/bash
# /etc/init.d/Anoka.sh

### BEGIN INIT INFO
# Provides:          servoblaster
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start node Anoka app at startup
# Description:       Start node Anoka app at startup
### END INIT INFO

case "$1" in 
    start)
        echo "Starting Node Server"
        # Find USB Drive Path
        DRIVEPATH=$(awk -v needle="/dev/sda1" '$1==needle {print $2}' /proc/mounts)
        echo "USB Drive Path: $DRIVEPATH"
        # Run the Node App
        forever --append -l $DRIVEPATH/logfile.txt -o $DRIVEPATH/outfile.txt -e $DRIVEPATH/errfile.txt start $DRIVEPATH/server.js &
        # node $DRIVEPATH/server.js >> $DRIVEPATH/log.txt &
        # Run the utility that hides the mouse after a while
        sudo unclutter -idle 1 &
        # Wait for the server to get it's act together
        sleep 30
        # Run the interface using Chromium
        chromium 127.0.0.1:8000 --kiosk --incognito --user-data-dir
        ;;
    stop)
        echo "Stopping Node Server"
        sudo killall chromium
        sudo killall node
        sudo killall unclutter
        ;;
    *)
        echo "Usage: /etc/init.d/servod start|stop"
        exit 1
        ;;
esac

exit 0