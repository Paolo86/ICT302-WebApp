
function buildStudentTable(list)
{
    
    var table = `
    <table class='table table-striped'>
    <thead>
    <tr>
        <th>Student ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
    </tr>
    </thead>
    <tbody>
    `

    for(var i=0; i < list.length; i++)
    {
        
        table += `
        <tr>
            <td>${list[i][1]}</td>
            <td>${list[i][2]}</td>
            <td>${list[i][3]}</td>
            <td>${list[i][4]}</td>
            <td><button type='button' class='btn btn-primary' onClick='onSessionButtonClicked(${list[i][0]},"${list[i][2]}","${list[i][3]}" )'>Session</button></td>
            <td><button type='button' class='btn btn-primary' onClick='GetStudentAccount(${list[i][1]},"${list[i][2]}","${list[i][3]}","${list[i][4]}")'>Edit</button></td>
            <td><button type='button' class='btn btn-danger' onClick="DeleteStudent(${list[i][0]})">Delete</button></td>    
        </tr>
        `
    }

    table += `</tbody>
    </table>`

    return table;
}

var cachedStudentTable;
var cachedStudentList;

$(document).ready(function () {

    //Update assessment mode button
    DoPost("server/getConfiguration.php",{},(response)=>{
        //console.log(response)
        var obj = JSON.parse(response);
        var checked = obj.Data.AssessmentMode === 'true';
        $("#assessment-mode-btn").prop("checked",checked)

        },
        (data, status, error)=>
        {
            
        } 
    )

    var token = getToken()
    var mus = getMUS()

    var myData = {
        Token: token,
        MurdochUserNumber: mus
    }    

    $(".custom-file-input").on("change", function() {
        
        var fd = new FormData();
        var files = $('#customFile')[0].files[0];
        fd.append('file',files);
        fd.append('MurdochUserNumber',getMUS())
        fd.append('Token',getToken())
        

        $.ajax({
            url: address + 'server/uploadStudentList.php',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){  
                console.log(response)

                    var obj = JSON.parse(response)
                    if(obj.Status == 'ok')
                    {
                        window.location = 'admin.php';

                    } 
                    else
                    {
                        alert(obj.Message)
                        window.location = 'admin.php';
                    }
                
                
            },
        });
      });
    
    DoPost("server/getStudentList.php",myData,(response)=>{

        var obj = JSON.parse(response);
        var list = JSON.parse(obj.Data.Content)

        cachedStudentList = list;
        var table = buildStudentTable(list)
        cachedStudentTable = table;
        $("#welcome-title").html("Welcome " + obj.Data.UserName)
        $("#main-content").html(table)

        },
        (data, status, error)=>
        {
            alert("An error occurred")
        } 
    )

    // Click account button
    $("#account-btn").click(function(e){

        $("#search-field").hide();

        var token = getToken()
        var mus = getMUS()
    
        var data = {
            MurdochUserNumber: mus,
            Token: token
        }
    
        DoPost("server/getUserDetails.php",data,(response)=>{
            
            var responseObj = JSON.parse(response)
            var data = JSON.parse(responseObj.Data)
            GenerateAccountTable(data)         

    
            },
            (data, status, error)=>
            {
                alert("An error occurred")
            } 
        )
    })

    // Assessment mode button
    $("#assessment-mode-btn").click(function() {
        
        if($("#assessment-mode-btn").prop("checked"))
        {

            if(confirm("Are you sure you want activate Assessment mode?"))
            {
                $("#assessment-mode-btn").prop("checked",true)           
            }
            else
            {
                
                $("#assessment-mode-btn").prop("checked",false)
            }
            
        }

        var token = getToken()
        var mus = getMUS()
        var checked = $("#assessment-mode-btn").prop("checked");
        var data = {
            MurdochUserNumber: mus,
            Token: token,
            Checked: checked

        }
        
        DoPost("server/updateAssessmentMode.php",data,(response)=>{            
          //  console.log(response)
        },
        (data, status, error)=>
        {
   
        } 
        )   
    });
})

function backToStudentTable()
{
    $("#main-content").html(cachedStudentTable);
    $("#search-field").show();
}

function searchStudent()
{

    var search = $("#search-field").val()
    var list = []
    for(var i=0; i< cachedStudentList.length; i++)
    {
        //console.log(cachedStudentList[i][1])
        // If student no, name or email mcontain the search bar value
        if(String(cachedStudentList[i][1]).indexOf(search) != -1 || String(cachedStudentList[i][2]).toLowerCase().indexOf(search.toLowerCase()) != -1 
            || String(cachedStudentList[i][3]).toLowerCase().indexOf(search.toLowerCase()) != -1 || String(cachedStudentList[i][4]).toLowerCase().indexOf(search.toLowerCase()) != -1)
            list.push(cachedStudentList[i])
    }
    
    var table = buildStudentTable(list)
    cachedStudentTable = table;
    $("#main-content").html(table);

}

//The 'Data' from the response object is cached so it can be passed in dynamically created functions
var responseData;
function onSessionButtonClicked(id,firstname,lastname)
{
    var token = getToken()
    var mus = getMUS()
    $("#search-field").hide();
    var myData = {
        UserID: id,
        Token: token,
        MurdochUserNumber: mus
    }
    DoPost("server/getStudentSessions.php",myData,(response)=>{

        //console.log(response)
        var sessionObj = JSON.parse(response)
        responseData = JSON.parse(sessionObj.Data)

        var table = buildSessionTable(responseData)

        var html = '<h3 style="margin: auto">' + firstname + ' ' +  lastname + '</h3>'
        html += table;
        $("#main-content").html(html);   

        },
        (data, status, error)=>
        {
            alert("An error occurred")
        } 
    )
}

function GenerateAccountTable(data)
{

    var table = `
    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Murdoch ID</label>
        <input id="mus-field" type="text" class="form-control col-lg-10" readonly/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">First Name</label>
        <input id="firstname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Last Name</label>
        <input id="lastname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Email</label>
        <input id="email-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <button id="self-details-btn" type='button' class='btn btn-primary m-2' onClick="ChangeSelfDetails()">Save changes</button>
        <button type='button' class='btn btn-primary m-2' id="change-psw-btn" onClick="ChangePassword()">Change password</button>
    </div>
    `
    $("#main-content").html(table)    

    $("#mus-field").val(data.MurdochUserNumber)
    $("#firstname-field").val(data.FirstName)
    $("#lastname-field").val(data.LastName)
    $("#email-field").val(data.Email)

    $("#self-details-btn").click(function(e){
        if(confirm("You want to save the changes made?"))
        {
            var fName = $("#firstname-field").val();
            var lName = $("#lastname-field").val();
            var email = $("#email-field").val();
            var token = getToken()
            var mus = getMUS()
    
            var data = {
                FirstName: fName,
                LastName: lName,
                Email: email,
                MurdochUserNumber: mus,
                Token: token
            }
    
            DoPost("server/updateAccountDetails.php",data,(response)=>{
    
                console.log(response)
                var rObj = JSON.parse(response)
                alert(rObj.Message)       
        
                },
                (data, status, error)=>
                {
                    alert("An error occurred")
                } 
            )    
        }
    })
    
}

function ChangePassword()
{
    if(confirm("Changing your password will require you to log in again. Do you wish to continue?"))
    {
        LogOut(); //Defined in 'functions.js'
        var win = window.open('../web/resetPassword.php', '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    }
}

function GetStudentAccount(id,firstname,lastname, email)
{
    $("#search-field").hide();

    var table = `
    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Murdoch ID</label>
        <input id="mus-field" type="text" class="form-control col-lg-10" readonly/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">First Name</label>
        <input id="firstname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Last Name</label>
        <input id="lastname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Email</label>
        <input id="email-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <button type='button' class='btn btn-primary m-2' id="change-student-details-btn">Save changes</button>
        <button type='button' class='btn btn-primary m-2' id="reset-psw-btn" >Reset password</button>
    </div>
    `
    $("#main-content").html(table);

    $("#mus-field").val(id)
    $("#firstname-field").val(firstname)
    $("#lastname-field").val(lastname)
    $("#email-field").val(email)

    //Change student details button
    $("#change-student-details-btn").click(function(e){
        if(confirm("You want to save the changes made to this account?"))
        {
            var fName = $("#firstname-field").val();
            var lName = $("#lastname-field").val();
            var email = $("#email-field").val();
            var smus = $("#mus-field").val();
            var token = getToken()
            var mus = getMUS()
    
            var data = {
                MurdochUserNumber: mus,
                Token: token,
                FirstName: fName,
                LastName: lName,
                Email: email,
                SMUS: smus
            }
    
            DoPost("server/updateAccountDetails.php",data,(response)=>{
    
                console.log(response)
                var rObj = JSON.parse(response)
                alert(rObj.Message)       
        
                },
                (data, status, error)=>
                {
                    alert("An error occurred")
                } 
            )
    
        }

    })

    //Reset password
    $("#reset-psw-btn").click(function(e){

        if(confirm("Do you want to reset the password for this account?"))
        {
            var token = getToken()
            var mus = getMUS()

            var data = {
                Token: token,
                MurdochUserNumber: mus,
                AccountID: id
            }
            DoPost("server/resetStudentPassword.php",data,(response)=>{

                  var obj = JSON.parse(response)
                  alert(obj.Message)
        
                },
                (data, status, error)=>
                {
                    alert("An error occurred")
                } 
            )
        }
    })
}


function GetOwnSession()
{
    var token = getToken()
    var mus = getMUS()
    $("#search-field").hide();
    var myData = {
        Token: token,
        MurdochUserNumber: mus
    }
    DoPost("server/getStudentSessions.php",myData,(response)=>{

        //console.log(response)
        var sessionObj = JSON.parse(response)
        responseData = JSON.parse(sessionObj.Data)

        var table = buildSessionTable(responseData)
        $("#main-content").html(table);   
   

        },
        (data, status, error)=>
        {
            alert("An error occurred")
        } 
    )
}


function CreateUserTable()
{
    var table = `
    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Murdoch ID</label>
        <input id="mus-field" type="text" class="form-control col-lg-10" />
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">First Name</label>
        <input id="firstname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Last Name</label>
        <input id="lastname-field" type="text" class="form-control col-lg-10"/>
    </div>

    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Email</label>
        <input id="email-field" type="text" class="form-control col-lg-10"/>
    </div>
    <div class="col-lg-12 row m-2">
        <label class="col-lg-2">Admin</label>
        <div class="material-switch pull-right">
            <input id="admin-switch" name="someSwitchOption001" type="checkbox"/>
            <label for="admin-switch" class="label-primary"></label>
        </div>
    </div>    

    <div class="col-lg-12 row m-2">
        <button type='button' class='btn btn-primary m-2' onClick="CreateAccount()">Create account</button>
    </div>
    `

    $("#search-field").hide();
    $("#main-content").html(table);

    $("#admin-switch").change(function() {
        
       if($("#admin-switch").prop("checked"))
       if(confirm("Are you sure you want to give this account administrator privileges?"))
        $("#admin-switch").prop("checked",true)
        else
        $("#admin-switch").prop("checked",false)
        
      });

    // Eliminate non numbers characters
    $("#mus-field").change(function() {
        
        var newValue = "";
        for(var i=0; i< $("#mus-field").val().length; i++)
        {
            if(IsNumber($("#mus-field").val()[i]))
            {  
                newValue += $("#mus-field").val()[i];
            }
        }
       
        $("#mus-field").val(newValue)
        
      });
}

function IsNumber(c){
    return (c >= "0" && c <= "9");
}

function removeAllNonNumbers(value)
{
    var newValue = "";
    for(var i=0; i< value.length; i++)
    {
        if(isNumber(value[i]))
        {  
            newValue += value[i];
        }
    }
    return newValue;
}

function CreateAccount()
{
    var murdochID = $("#mus-field").val()
    var fName = $("#firstname-field").val()
    var lName = $("#lastname-field").val()
    var email = $("#email-field").val()
    var isAdmin = $("#admin-switch").prop("checked")? 1 : 0;

    //console.log("Is admin " + isAdmin)

    if(murdochID == '' || fName == '' || lName == '' || email == '')
    {
        alert("Empty fields not allowed")
        return
    }
    
  
    var mus = getMUS()
    var token = getToken()

    var data = {
        MurdochUserNumber: mus,
        Token: token,
        AdminMUS: murdochID,
        AdminFName: fName,
        AdminLName: lName,
        AdminEmail: email,
        AdminPriv: isAdmin
    }


    if (confirm("Do you want to create a new account for " + fName + " " + lName + "?")) {
        alert("Request sent.")
        DoPost("server/createUser.php",data,(response)=>{
            
            var obj = JSON.parse(response)
            if(obj.Status == 'ok')
            {
                alert(obj.Message)
                window.location = "admin.php" //Refresh
                
            }
    
            },
            (data, status, error)=>
            {
               // alert("An error occurred")
            } 
        )
      }
}


function DeleteStudent(userID)
{
    var token = getToken()
    var mus = getMUS()

    var myData = {
        UserID: userID,
        Token: token,
        MurdochUserNumber: mus
    }

    if (confirm("Are you sure you want to delete this account?")) {
        DoPost("server/deleteAccount.php",myData,(response)=>{

            var obj = JSON.parse(response)
            if(obj.Status == 'ok')
            {
                window.location = "admin.php" //Refresh
            }
    
            },
            (data, status, error)=>
            {
                alert("An error occurred")
            } 
        )
      }    
}




function GetCSV()
{
    var token = getToken()
    var mus = getMUS()

    var data = {
        Token: token,
        MurdochUserNumber: mus
    }

    DoPost("server/generateCSV.php",data,(response)=>{

        //Try parsing. If fails, it actually means that we are receiving the file to download
            try{

                var obj = JSON.parse(response)
                alert(obj.Message)
            }
            catch(e)
            {
                var blob = new Blob([response], { type:'text/csv' }),
                a    = document.createElement('a'),
                url  = URL.createObjectURL(blob);
                a.href = url;
                a.download = 'data.csv';
                a.click()
            }
        })    
}
