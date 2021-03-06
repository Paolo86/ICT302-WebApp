<?php
	session_start();
	include("globals.php");
    include("functions.php");    

     if(isset($_POST['LayoutName']))
	{
		//Incoming variables
        $id = $_POST["LayoutName"];
		$con = connectToDb();

		$stmt = $con->prepare("select * from layout where LayoutName = ?");	
		$stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
		
		//Prepare reply pbject
		$reply = new stdClass();
		$reply->Data = new stdClass();
		
		if($result && $result->num_rows > 0)
		{
          	//Check if admin
			$data = $result->fetch_assoc();
			$stmt = $con->prepare("delete from layout where LayoutName = ?");	
			$stmt->bind_param("s", $id);
			$stmt->execute();

			// Check if it's active one, if so, set the Value to ''
			$stmt = $con->prepare("select * from configuration WHERE ConfigName = 'ActiveLayout'");
        	$stmt->execute();
        	$result = $stmt->get_result();					
                    
        	if($result && $result->num_rows > 0)
        	{
				$data = $result->fetch_assoc();
				if($data['Value'] == $id)
				{
					$stmt = $con->prepare("update configuration SET Value = '' WHERE ConfigName = 'ActiveLayout'");
					$stmt->execute();					
				}
			$reply->Data->IsActive = 'true';    

			}


			$reply->Status = 'ok';    
			$reply->Message = "Layout successfully deleted";
		}
		else
		{
			$reply->Status = 'fail';
			$reply->Message = "Layout not found";
		}
        mysqli_close($con);
		
		// Send reply in JSON format
		$myJSON = json_encode($reply);			
		echo $myJSON;			
    }
    

?>