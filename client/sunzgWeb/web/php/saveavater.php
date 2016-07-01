<?php
//session_start();

$rs = array();

switch($_GET['action']){

	//�ϴ���ʱͼƬ
	case 'uploadtmp':
		$file = 'uploadtmp.jpg';
		@move_uploaded_file($_FILES['Filedata']['tmp_name'], $file);
		$rs['status'] = 1;
		$rs['url'] = './php/' . $file;
	break;

	//�ϴ���ͷ��
	case 'uploadavatar':
		$filename="teststream".time().".jpg";
		$input = file_get_contents('php://input');
		$data = explode('--------------------', $input);
		//file_put_contents('avatar_1'.time().'.jpg', $data[0]);
		//file_put_contents('avatar_2.jpg', $data[1]);


       // $xmlstr =  $GLOBALS[HTTP_RAW_POST_DATA];
        //if(empty($xmlstr)) $xmlstr = file_get_contents('php://input');

        $jpg = $data[0];//得到post过来的二进制原始数据
        $file = fopen("pic/".$filename,"w");//打开文件准备写入
        fwrite($file,$jpg);//写入
        fclose($file);//关闭
		$rs['status'] = 1;
		$rs["path"]="pic/".$filename;
	break;

	default:
		$rs['status'] = -1;
}

print '{"status":1,"path":"/avatar/20151204/1449222693240.png"}';

?>
