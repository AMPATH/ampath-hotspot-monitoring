:local bundledUrl "http://safaricom.com/bundles/GetSubDetails"
:local locationId "1"
:local monitoringServerUrl "http://192.168.1.254:3000"
/tool fetch url="$bundledUrl"
global output [/file get GetSubDetails contents]
:global messageencoded ""
:for i from=0 to=([:len $output] - 1) do={ 
  :local char [:pick $output $i]
  :if ($char = " ") do={
   :set $char "%20"
 }
  :if ($char = "-") do={
    :set $char "%2D"
  }
  :if ($char = "#") do={
    :set $char "%23"
  }
  :if ($char = "+") do={
    :set $char "%2B"
  }
 :if ($char = "\n") do={
    :set $char "%0A"
  }
  :set messageencoded ($messageencoded . $char)
}
:local finalURL
:set finalURL "$monitoringServerUrl/bundles/$locationId?data=$messageencoded" 
/tool fetch url="$finalURL" mode=http keep-result=no