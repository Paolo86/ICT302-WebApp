<?php
	session_start();
	include("globals.php");
    include("functions.php");
    
    // List in the order they appear in the CSV header
    function GetDatabaseColumn($index)
        {
            switch($index)
            {
                case 0:
                    return 'MurdochUserNumber';
                case 1:
                    return 'LastName';
                case 3:
                    return 'FirstName';
                case 26:
                    return 'Email';
                default:
                return '';
            }
        }

    function ReadFileAndUpdateDB($target_path)
    {
        $file = fopen($target_path, "r") or die("Unable to open file!");

        // Read students into array of Student objects
        $allStudents = array();
        while(!feof($file))
        {
            $line =  fgets($file);
            $student = array();

            $tok = explode(",",$line);
            for($i = 0; $i < count($tok);$i++)
            {
                $column = GetDatabaseColumn($i);
                if($column != '')
                {
                    $student[$column] = $tok[$i];
                }
            }

            //Check that all columns are set
            if(isset($student['MurdochUserNumber']) && isset($student['FirstName']) && isset($student['LastName']) && isset($student['Email']))
                array_push($allStudents,$student);
        }        

        fclose($file);

        //Update DB
        $con = connectToDb();
        for($i = 0; $i < count($allStudents);$i++)
        {
            $stmt = $con->prepare("select * from user where MurdochUserNumber = ?");                

            $stmt->bind_param("i", $allStudents[$i]['MurdochUserNumber']);
            $stmt->execute();
            $result = $stmt->get_result();
                    
            // If user is found, update details
            if($result && $result->num_rows > 0)
            {	
                $mus = trim($allStudents[$i]['MurdochUserNumber'], " ");
                $firstName = trim($allStudents[$i]['FirstName'], " ");
                $lastName = trim($allStudents[$i]['LastName'], " ");
                $email = trim($allStudents[$i]['Email'], " ");

                $stmt = $con->prepare("update user set FirstName = ?, LastName = ?, Email = ? WHERE  MurdochUserNumber = ?");
				$stmt->bind_param("sssi", $firstName, $lastName, $email, $mus);
				$status = $stmt->execute();
            }
            else //If not found, insert
            {
                $mus = trim($allStudents[$i]['MurdochUserNumber'], " ");
                $firstName = trim($allStudents[$i]['FirstName'], " ");
                $lastName = trim($allStudents[$i]['LastName'], " ");
                $email = trim($allStudents[$i]['Email'], " ");

                $stmt = $con->prepare("insert into user (MurdochUserNumber,FirstName,LastName,Email) VALUES (?,?,?,?)");
				$stmt->bind_param("isss", $mus,  $firstName, $lastName, $email);
				$status = $stmt->execute();
            }
        }

    }
    //Prepare reply pbject
    $reply = new stdClass();
    $reply->Data = new stdClass();

    if(isset($_POST['MurdochUserNumber']) && isset($_POST['Token']))
    {
        $id = $_POST['MurdochUserNumber'];

        $con = connectToDb();

        //Prepare SQL statement. Place a '?' where you want to pass an argument
        // Below I'm passing the student ID
        $stmt = $con->prepare("select * from user where MurdochUserNumber = ?");
                
        // This is where I'm passing the actual argument
        $stmt->bind_param("s", $id);
                
        // Execute the SQL statement!
        $stmt->execute();
                
        //Check if we got something	
        $result = $stmt->get_result();					
                
        if($result && $result->num_rows > 0)
        {			
            $data = $result->fetch_assoc(); //Get first fow
            //Ensure It's admin
            if($data['IsAdmin'] == 1)
            {
                /* Getting file name */
                $file_name = $_FILES['file']['name'];
                $file_size = $_FILES['file']['size'];
                $file_tmp = $_FILES['file']['tmp_name'];
                $file_type = $_FILES['file']['type'];

                $file_parts = pathinfo($file_name);

                switch($file_parts['extension'])
                {
                    case "csv":
                        $destination_path = getcwd().DIRECTORY_SEPARATOR;

                        $result = 0;
                        
                        $target_path = $destination_path . "Uploads/".basename( $file_name);
        
                        move_uploaded_file($file_tmp,$target_path);
        
                        ReadFileAndUpdateDB($target_path);
        
                        $reply->Status = 'ok';
                        $reply->Message = 'Class list updated successfully!';
                    break;
                    default:
                    $reply->Status = 'fail';
                     $reply->Message = 'Only CSV file accepted';
           
                }
               
            }
            else
            {
                $reply->Status = 'fail';
                $replu->Message = 'Not authorized';
            }
        }
        else
        {
            $reply->Status = 'fail';
            $replu->Message = 'User not found';
        }
    }
    else
    {
        $reply->Status = 'fail';
        $replu->Message = 'Missing info';
    }

    // Send reply in JSON format
    $myJSON = json_encode($reply);			
    echo $myJSON;


?>