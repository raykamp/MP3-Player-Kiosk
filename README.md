MP3-Player-Kiosk
================
This project is intended to run on a Raspberry Pi

Requirements
================
* Raspberry Pi
* 4GB class 4 sd card 
* 2014-06-20-wheezy-raspbian.img operating system image
* Keyboard and mouse
* Monitor
* Ethernet Internet connection 
* Anoka Ramsey nodes Mp3 player app/files
* USB drive (FAT formatted)


Installation 
================

1. Create SD card:
    1. On a Mac OS X computer, use the following “Command Line” instructions to copy the operating system image to the flash drive (This takes around 45 min): http://www.raspberrypi.org/documentation/installation/installing-images/mac.md
    1. Open “Disk Utility”. Examine the 4gb SD Card. 
    1. Click the “Partition” tab and you should see two partitions, “BOOT" and “disk1s1”.
    1. Add a new 512Mb partition formatted as exFat

1. Start up the Pi:
    1. Eject the SD card and place it in the Raspberry PI. 
    1. Plug in the monitor, keyboard, mouse, ethernet cable, and power to the Pi
    1. Get to the command line. 

1. Expand the filesystem and configure desktop mode: 
    1. Run `sudo raspi-config`
    1. Select option #1 “Expand Filesystem” and click yes/ok on any prompts
    1. Select option #3 “Enable Boot to Desktop/Scratch”. Then select the second option “Desktop Log in as user ‘pi’.
    1. Select “Finish” to exit raspi-config. Select “Yes” on the prompt that asks if you “Would like to reboot now?”. Otherwise, run `sudo shutdown -r now` to restart the pi

1. Update Packages
    1. Run `sudo apt-get update`
    1. Run `sudo apt-get upgrade` 
    1. This may take an hour or so

1. Install Node.js for Raspberry Pi. Compiled package is on Adafruit’s website
    1. Run `sudo wget http://node-arm.herokuapp.com/node_latest_armhf.deb`
    1. Run `sudo dpkg -i node_latest_armhf.deb`
    
1. Install Chromium
    1. Run `sudo apt-get install chromium`

1. Install audio library:
    1. Run `sudo apt-get install libasound2-dev`

1. Install “unclutter” to hide the mouse after some time
    1. Run `sudo apt-get install unclutter`

1. Disable the screensaver
    1. Run `sudo nano /etc/lightdm/lightdm.conf`
    1. Add the following lines to the [SeatDefaults] section:   
    ```
      #don’t sleep the screen
      xserver-command=X -s 0 dpms   
    ```

1. Use Headphone Output
    1. Run `amixer cset numid=3 1`

1. Prepare the USB drive
    1. Copy the node application files and mp3’s to the root folder of the flash drive
    1. “server.js” should be on the root level 

1. Install node modules as global
    1. Run `sudo npm install -g id3js socket.io async lame speaker forever`
    
1. Install the app
    1. Plug the flash drive into the raspberry pi
    1. Using the command line, “cd” (change directories) to the root folder of the flash drive
    1. Run `cp installBootScript.sh ~/Desktop/`
    1. Run `chmod +x ~/Desktop/installBootScript.sh`
    1. Run `bash ~/Desktop/installBootScript.sh`

1. Reboot the pi and enjoy
    1. Run `sudo shutdown -r now`
