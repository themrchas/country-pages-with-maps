<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ Page Language="C#" %>
<%@ Register tagprefix="SharePoint" namespace="Microsoft.SharePoint.WebControls" assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
<meta name="WebPartPageExpansion" content="full" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<SharePoint:CssRegistration Name="default" runat="server"/>
		<title>Homepage</title>
	  	<base href="http://ekm-sp13/sites/socaf/homepage-integration/SiteAssets/homepage/dist/">
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
	
	<!--<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
	<script type="text/javascript" src="polyfills.19a039d8d9f93fbd2388.js"></script>
	<script type="text/javascript" src="scripts.7b938c1dc4579adbbd5c.js"></script>
	<script type="text/javascript" src="main.2d582be61e8a0a2b47f6.js"></script>-->
	
	<!-- Templates for Top Navigation Menus -->
	<script type="text/template" id="menu-cg">
	      <li><a href="#">Action</a></li>
	      <li><a href="#">Another action</a></li>
	      <li><a href="#">Something else here</a></li>
	</script>
	<script type="text/template" id="menu-dirs">
		<div class="row">
          <div class="col-sm-4">
            <div class="menu-section"><a class="menu-header" href="#">J1</a></div>
            <div class="menu-section"><a class="menu-header" href="#">J2</a></div>
            <div class="menu-section"><a class="menu-header" href="#">J3</a>
              <ul class="menu-links">
                <li><a href="#">Action</a></li>
                <li><a href="#">Another action</a></li>
                <li><a href="#">Something else here that's extra long so we can see how it looks</a></li>
              </ul>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="menu-section"><a class="menu-header" href="#">J1</a></div>
            <div class="menu-section"><a class="menu-header" href="#">J2</a></div>
            <div class="menu-section">
              <div class="menu-header"><a href="#">J3</a></div>
              <ul class="menu-links">
                <li><a href="#">Action</a></li>
                <li><a href="#">Another action</a></li>
                <li><a href="#">Something else here that's extra long so we can see how it looks</a></li>
              </ul>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="menu-section"><a class="menu-header" href="#">J1</a></div>
            <div class="menu-section"><a class="menu-header" href="#">J2</a></div>
            <div class="menu-section">
              <div class="menu-header">J3</div>
              <ul class="menu-links">
                <li><a href="#">Action</a></li>
                <li><a href="#">Another action</a></li>
                <li><a href="#">Something else here that's extra long so we can see how it looks</a></li>
              </ul>
            </div>
          </div>
        </div>
    </script>
	<script type="text/template" id="menu-components">
		<li><a href="#">Action</a></li>
	    <li><a href="#">Another action</a></li>
	    <li><a href="#">Something else here</a></li>
	</script>
	<script type="text/template" id="menu-info">
	</script>
	<script type="text/template" id="menu-tools">
	</script>
	<script type="text/template" id="menu-external">
	</script>
	<script type="text/template" id="menu-help-desk">
		  <li><a href="#">Action</a></li>
	      <li><a href="#">Another action</a></li>
	      <li><a href="#">Something else here</a></li>
	</script>
	<script type="text/template" id="search-tips">
   		<h4>Explore SOCAFRICA</h4>
    	<div>Enter keyword(s) or people.  For example, "J6" or "John Smith".</div><br/>
    	<div>Or, try these specialized search terms:
                    <ul>
                      <li>Type <i>TSR XXXX</i> to search for a TSR by ID.</li>
                      <li>Type <i>ICAO XXXX</i> to search for an airport code by ID.</li>
                    </ul>
         </div>
    </script>

</body>

</html>
