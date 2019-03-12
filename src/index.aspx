<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ Page Language="C#" %>
<%@ Register tagprefix="SharePoint" namespace="Microsoft.SharePoint.WebControls" assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
<meta name="WebPartPageExpansion" content="full" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<SharePoint:CssRegistration Name="default" runat="server"/>
		<title>SOCAFRICA Country Pages</title>
	  	<base href="http://ekm-sp13/sites/socafdev/SiteAssets/CountryPages/">
	  	<meta name="viewport" content="width=device-width, initial-scale=1">
	  	<link href="favicon.ico" rel="shortcut icon" type="image/ico">
	  	
	  	<script src="/_layouts/MicrosoftAjax.js"></script>
	  	<SharePoint:ScriptLink ID="registerSP" runat="server" OnDemand="False" LoadAfterUI="True" Name="sp.js" Localizable="False"/>
	  	<SharePoint:FormDigest runat="server"/>
	  	
	  	<link rel="stylesheet" href="http://ekm-sp13/_layouts/15/1033/STYLES/COREV15.css" text="text/css" />
	  	<!--<link rel="stylesheet" href="styles.28aa0f3c23f5edc9a587.css"/>-->

</head>

<body>

	<form id="sharepointForm" runat="server"></form>
	<app-root></app-root>	
	

	<script type="text/javascript" src="runtime.js"></script>
	<script type="text/javascript" src="polyfills.js"></script>
	<script type="text/javascript" src="styles.js"></script>
	<script type="text/javascript" src="scripts.js"></script>
	<script type="text/javascript" src="vendor.js"></script>
	<script type="text/javascript" src="main.js"></script>

</body>

</html>
