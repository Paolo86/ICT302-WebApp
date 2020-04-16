<?php
	session_start();
	include("globals.php");
    include("functions.php");    

     if(isset($_POST['Token']) && $_POST['Token'] != "" && isset($_POST["MurdochUserNumber"]))
	{
		//Incoming variables
        $token = $_POST['Token'];		
        $id = $_POST["MurdochUserNumber"];
		$con = connectToDb();

		$stmt = $con->prepare("select * from user where Token = ? AND MurdochUserNumber = ?");	
		$stmt->bind_param("ss", $token, $id);
        $stmt->execute();
        $result = $stmt->get_result();
		
		//Prepare reply pbject
		$reply = new stdClass();
		$reply->Data = new stdClass();
		
		if($result && $result->num_rows > 0)
		{
          	//Check if admin
			$data = $result->fetch_assoc();
			// Student requestiont session
            if($data['IsAdmin'] == 0)
            {	
				$stmt = $con->prepare("select * from session where UserID = ?");	
				$stmt->bind_param("s", $data['UserID']);
                $stmt->execute();
                $result = $stmt->get_result();
                $encoded = json_encode($result->fetch_all());
				$reply->Data->Content = $encoded;
                $reply->Data->UserName = $data['FirstName'];
				
			}
			else
			{
				// Admin requesting student sessions
				if(isset($_POST['UserID']))
				{
					$stmt = $con->prepare("select * from session where UserID = ?");	
					$stmt->bind_param("s", $_POST['UserID']);
					$stmt->execute();
					$result = $stmt->get_result();
					$encoded = json_encode($result->fetch_all());
					$reply->Data = $encoded;
				}
				else
				{
					// Admin requestion their own session
					if($data['IsAdmin'] == 1 && $data['MurdochUserNumber'] == $id)
					{
						$stmt = $con->prepare("select * from session where UserID = ?");	
						$stmt->bind_param("s", $data['UserID']);
						$stmt->execute();
						$result = $stmt->get_result();
						$encoded = json_encode($result->fetch_all());
						$reply->Data = $encoded;
					}
				}
			}
		}
		else
		{
			$reply->Status = 'fail';
			$reply->Message = "User not found";
		}
        mysqli_close($con);
		
		// Send reply in JSON format
		$myJSON = json_encode($reply);			
		echo $myJSON;			
    }
    

?>