#!/bin/bash

display_help() {
	echo
	echo "Usage: `basename $0` -n <projectName> -r <rootPath> [-g <groupName>] [-u <specialUserName>] [-h] "
	echo
	echo "	-n, --name	Assign new project name"
	echo "	-r, --rootPath	Path to project directory"
	echo
	echo "	-g, --groupName	Administrato Group Name"
	echo "	-u, --user	Special User Name for web server"
	echo
	echo "	-h, --help	Show this menu"
	exit 1
}


while :
do
  case "$1" in
	-h | --help)
		display_help
		exit 0
		;;
	-r | --rootPath)
		if [ ! -z "$1" ] ; then
			rootPath="$2"
			shift 2
		fi
		;;
	-n | --name)
		if [ ! -z "$1" ] ; then
			projectName="$2"
			shift 2
		fi
		;;
	-g | --groupName)
		if [ ! -z "$1" ] ; then
			groupName="$2"
			shift 2
		fi
		;;
	-u | --user)
		if [ ! -z "$1" ] ; then
			userName="$2"
			shift 2
		fi
		;;
	--)
		shift
		break
		;;
	-*)
		echo
		echo "Error: Unknown option: $1"
		display_help
		exit 1
		;;
	*)
		break
		;;
  esac

done

if [ -z $rootPath ] || [ -z $projectName ] ; then
	echo
	echo "-r and -n are required"
	echo
	display_help
	exit 0
fi

#check path exist
if [ ! -d $rootPath ] ; then
	echo
	echo "Path $rootPath is not exist"
	echo
	exit 0
fi

#check new project name does not exist
if [ -d "$rootPath/$projectName" ] ; then
	echo
	echo "Project ''$projectName'' is exist"
	echo
	exit 0
fi

#check group exist
if [ ! -z $groupName ] ; then
	if [ ! $(getent group $groupName) ]; then
		echo "Group ''$groupName'' is not exist"
		exit 0
	fi
fi

#check user exist
if [ ! -z $userName ] ; then
	getent passwd $userName > /dev/null
	if [ "$?" -ne 0 ] ; then
		echo "User ''$userName'' is not exist"
		exit 0
	fi
fi

mkdir "$rootPath/$projectName"
if [ ! -z $groupName ] ; then
	chgrp $groupName "$rootPath/$projectName"
fi

chmod 770 "$rootPath/$projectName"
if [ ! -z $userName ] ; then
	setfacl -R -m "u:$userName:rwx" "$rootPath/$projectName"
	setfacl -R -d -m "u:$userName:rwx" "$rootPath/$projectName"
fi

chmod -R g+s "$rootPath/$projectName"
#chmod 
