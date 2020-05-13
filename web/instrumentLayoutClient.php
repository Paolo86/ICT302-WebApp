<?php
    session_start();
    include("../server/globals.php");
    include("../server/functions.php");
    $mus = "";
    $token = "" ;
    if(isset($_SESSION['MurdochUserNumber']) && isset($_SESSION['Token']))
    {
        $mus = $_SESSION['MurdochUserNumber'];
        $token = $_SESSION['Token']; 
    }
    else if(isset($_COOKIE['MurdochUserNumber']) && isset($_COOKIE['Token']))
    {
        $mus = $_COOKIE['MurdochUserNumber'];
        $token = $_COOKIE['Token']; 
    }
    else
        header("Location: " . $serverAddress . "index.php");
    
    if(!IsAccountOK($mus, $token))
        header("Location: " . $serverAddress . "index.php");
 
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Virtual Instruments</title>
    <link rel="icon" href="../imgs/logo.png">
    <!-- Stylesheets -->
    <link href="../css/resetstyle.css" rel="stylesheet" />
    <link href="../css/toggleswitch.css" rel="stylesheet" />
    <link href="../css/instrumentLayout.css" rel="stylesheet" />


    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <!-- Load scripts -->

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
        integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
        crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
        integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
        crossorigin="anonymous"></script>

    <!-- Import generic functions to do http requests -->
    <script src="../js/functions.js"></script>
    <script src="../js/instrumentLayout.js"></script>

</head>

<body>

    <nav class="navbar navbar-expand-md navbar-light bg-light">
        <div class="mx-auto order-0">
            <div class="navbar-brand">
                <img src="../imgs/logo.png" style="width: 50px;" />
                <span id="welcome-title">Welcome</span>
            </div>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".dual-collapse2">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="navbar-collapse collapse w-100 order-3 dual-collapse2">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="admin.php">Return to home</a>
                </li>
            </ul>
        </div>
    </nav>
    <div id="main-container">

        <section class="inner-section" id="main-form-section">
            <div class="container">
                <!-- Can be 'container' or 'container-fluid' -->
                <div class="row">
                        <div class="col-lg-2">
                            <div style="text-align: center;">
                                <p id="active-layout-label">Current Program Layout:</p>
                                <input type="button" id="load-active-btn" class="btn btn-primary btn-active"
                                    value="Load active layout" data-toggle="tooltip"
                                    title="Load the current layout being used in the application">
                            </div>
                        </div>
                        <div class="col-lg-10">
                            <div style="text-align: center;">
                                <div id="layout-settings" style="margin: 5px 0px 20px 0px">
                                    <!--Dropdown for selecting a saved layout-->
                                    <p>
                                        Select a layout configuration:
                                        <select id="select-layout-dropdown" data-toggle="tooltip"
                                            title="Select a layout to load from this dropdown">
                                            <option value="Layout 1">Layout 1</option>
                                            <option value="Layout 2">Layout 2</option>
                                            <option value="Layout 3">Layout 3</option>
                                        </select>
                                    </p>
                                    <input type="button" id="new-layout-btn" class="btn btn-primary"
                                        value="New Layout"
                                        style="background-color: darkgreen; border-color: darkgreen; margin-bottom: 5px;"
                                        data-toggle="tooltip"
                                        title="Delete the currently selected layout from the database">
                                    <input type="button" id="delete-layout-btn" class="btn btn-primary"
                                        value="Delete Layout"
                                        style="background-color: red; border-color: red; margin-bottom: 5px;"
                                        data-toggle="tooltip"
                                        title="Delete the currently selected layout from the database"><br>
                                    <input type="submit" id="save-layout-btn" class="btn btn-primary"
                                        value="Save layout" data-toggle="tooltip"
                                        title="Saves the current layout to the database">
                                    <input type="submit" id="activate-layout-btn" class="btn btn-primary"
                                        value="Make this layout active" data-toggle="tooltip"
                                        title="Saves the current layout and makes it the layout to be used in the application">
                                    <br>
                                    <!--Dropdown for how many slots to fill-->
                                    <p style="margin-top: 10px;">
                                        Max Instruments:
                                        <select id="select-size-dropdown" style="margin-top: 10px;"
                                            data-toggle="tooltip" title="How many instrument slots to display below">
                                            <option value="0">0</option>
                                        </select>
                                    <ul id="slot-dropdown-container">
                                    </ul>
                                    </p>
                                </div>
                                <p id="error-text"></p>
                            </div>
                        </div>
     
                    <div style="width: 100%; height: 100%; text-align: center;">

                        <img id="refimage" src="../imgs/TableReference.png">
                    </div>
                </div>
            </div>
        </section>
    </div>
</body>

</html>