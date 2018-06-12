:local interfaceWAN         "ether1";
:local interfaceWLAN        "wlan1";
:local interfaceWLANGuest   "wlan2";
:local prefix               "mikrotik-stats";
:local monitoringServerUrl             "http://192.168.1.254:3000";
:local locationId "1"
:local dataParams;

#
# Collection Groups
# Define what gets groups of statistics get collected and sent
#
:local enBoard true
:local enPerf true
:local enHealth true
:local enRouter true
:local enRouting true
:local enFirewall true
:local enWireless true
:local enVPN true
#
# End Setup


#
# Collect Stats: Board
#
:local boardData; :local identity; :local model; :local serial;
if ( $enBoard ) do={
:put "Collecting Board data..."
    :set identity             [/system identity get name];
    :set model                [/system routerboard get model];
    :set serial         [/system routerboard get serial-number];
    :set boardData        "identity=$identity&model=$model&serial=$serial"
    :set dataParams $boardData;

}
#
# Collect Stats: Perf
#
:local perfData; :local cpuLoad; :local memFree; :local uptime;
if ( $enPerf ) do={
    :put "Collecting Performance data..."
    :delay 5
    :set cpuLoad [/system resource get cpu-load];
    :set memFree [/system resource get free-memory];
    :set uptime [/system resource get uptime];
    :set perfData "cpu-load=$cpuLoad&uptime=$uptime&mem-free=$memFree"
    :set dataParams ( $dataParams . "&" . $perfData);
}

#
# Collect Stats: Health
#
:local healthData; :local volts; :local amps; :local watts; :local temp; :local cpuTemp; :local fanSpeed;
if ( $enHealth ) do={
    :put "Collecting Health data..."
    :set volts [/system health get voltage];
    :set amps [/system health get current];
    :set watts [/system health get power-consumption];
    :set temp [/system health get temperature];
    :set cpuTemp [/system health get cpu-temperature];
    :set fanSpeed [/system health get fan1-speed];
    :set healthData "volts=$volts&amps=$amps&watts=$watts&temp=$temp&cpu-temp=$cpuTemp&fan-speed=$fanSpeed"
    :set dataParams ( $dataParams . "&" . $healthData);
}


#
# Collect Stats: Router
#
:local routerData; :local ipRoutes;
if ( $enRouter ) do={
    :put "Collecting Router data..."
    :set ipRoutes [:len [/ip route find]];
    :set routerData  "ip-routes=$ipRoutes"
    :set dataParams ( $dataParams . "&" . $routerData);
}

#
# Collect Stats: Routing
#
:local routingData; :local bgpPeers; :local ospfNeighbors;
if ( $enRouting ) do={
    : put "Collecting Routing Protocol data..." ;
    :set bgpPeers [:len [/routing bgp peer find]];
    :set ospfNeighbors [:len [/routing ospf neighbor find]];
    :set routingData  "bgp-peers=$bgpPeers&ospf-neighbors=$ospfNeighbors";
    :set dataParams ( $dataParams . "&" . $routingData);
}

#
# Collect Stats: Wireless
#
:local wirelessData; :local wlanClients; :local wlanGuests;
if ( $enWireless ) do={
    :put "Collecting Wireless data...";
    :set wlanClients [/interface wireless registration-table print count-only where interface="$interfaceWLAN"];
    :set wlanGuests [/interface wireless registration-table print count-only where interface="$interfaceWLANGuest"];
    :set wirelessData "wlan-clients=$wlanClients&wlan-guests=$wlanGuests";
    :set dataParams ( $dataParams . "&" . $wirelessData);
}

#
# Collect Stats: Firewall
#
:local firewallData; :local ipFwConx;
if ( $enFirewall ) do={
    :put "Collecting Firewall data...";
    :set ipFwConx [/ip firewall connection tracking get total-entries];
    :set firewallData "ip-fw-conx=$ipFwConx";
    :set dataParams ( $dataParams . "&" . $firewallData);
}

#
# Collect Stats: VPN
#
:local vpnData; :local vpnPppConx; :local vpnIpsecPeers; :local vpnIpsecPolicy;
if ( $enFirewall ) do={
    :put "Collecting VPN data...";
    :set vpnPppConx [:len [/ppp active find]];
    :set vpnIpsecPeers [:len [/ip ipsec remote-peers find]];
    :set vpnIpsecPolicy [:len [/ip ipsec policy find]];
    :set vpnData "vpn-ppp-conx=$vpnPppConx&vpn-ipsec-peers=$vpnIpsecPeers&vpn-ipsec-policys=$vpnIpsecPolicy";
    :set dataParams ( $dataParams . "&" . $vpnData);
}


#
# Test Output of Collected Data
#
:put $boardData
:put $perfData
:put $healthData
:put $routerData
:put $routingData
:put $wirelessData
:put $firewallData
:put $vpnData


#
# Build the Final Request URL
#
:local finalURL;
:set finalURL "$monitoringServerUrl/mikrotik-stats/$locationId?$dataParams" 

# print the final url
:put $finalURL


#
# Push data to dweet.io
#
/tool fetch url="$finalURL" mode=http keep-result=no

# end of script