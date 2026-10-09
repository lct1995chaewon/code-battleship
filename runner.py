import ast
import io
import json
import contextlib

def run_lesson(source, requirements):
    output = io.StringIO()
    try:
        if len(source) > 6000:
            raise ValueError('程式太長，請控制在 6000 字元以內。')
        tree = ast.parse(source, filename='mission.py')
        allowed = (ast.Module, ast.Expr, ast.Call, ast.Name, ast.Load, ast.Constant,
                   ast.BinOp, ast.UnaryOp, ast.Add, ast.Sub, ast.Mult, ast.Div,
                   ast.FloorDiv, ast.Mod, ast.Pow, ast.UAdd, ast.USub, ast.keyword)
        for node in ast.walk(tree):
            if not isinstance(node, allowed):
                raise ValueError('本課練習支援 print()、type()、文字、數值、括號及算術運算。')
            if isinstance(node, ast.Name) and node.id not in ('print', 'type'):
                raise ValueError('本課只使用 print() 和 type()；請檢查函數名稱。')
            if isinstance(node, ast.Call) and (not isinstance(node.func, ast.Name) or node.func.id not in ('print','type')):
                raise ValueError('請使用 print() 或 type()。')
            if isinstance(node, ast.Constant) and (type(node.value) not in (str,int,float)):
                raise ValueError('本課使用整數、浮點數及字串。')
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow):
                if not isinstance(node.right, ast.Constant) or type(node.right.value) not in (int,float) or abs(node.right.value)>100:
                    raise ValueError('本練習的指數請使用 -100 至 100 的數值。')
        def classroom_print(*args, **kwargs):
            print(*args, **kwargs)
            if output.tell() > 4000:
                raise ValueError('輸出太長，請減少字串重複次數。')
        with contextlib.redirect_stdout(output):
            exec(compile(tree, 'mission.py', 'exec'), {'__builtins__': {'print':classroom_print,'type':type}}, {})
        nodes=list(ast.walk(tree))
        operators={type(n.op).__name__ for n in nodes if isinstance(n,ast.BinOp)}
        missing=[op for op in requirements.get('ops',[]) if op not in operators]
        calls=[n for n in nodes if isinstance(n,ast.Call)]
        checks=[]
        symbols={'Add':'+','Sub':'-','Mult':'*','Div':'/','FloorDiv':'//','Mod':'%','Pow':'**'}
        if missing: checks.append('請在算式中使用：'+'、'.join(symbols[op] for op in missing))
        if requirements.get('types',0)>sum(n.func.id=='type' for n in calls): checks.append('請使用 type() 檢查題目指定的數據。')
        if requirements.get('additions',0)>sum(isinstance(n,ast.BinOp) and isinstance(n.op,ast.Add) for n in nodes): checks.append('請分別寫出數字相加和字串連接的算式。')
        if requirements.get('grouped') and not any(isinstance(n,ast.BinOp) and isinstance(n.op,ast.Mult) and isinstance(n.left,ast.BinOp) and isinstance(n.left.op,ast.Add) for n in nodes): checks.append('第二個算式需要用括號，先加後乘。')
        if requirements.get('mixed') and not any(n.func.id=='print' and len(n.args)>1 for n in calls): checks.append('請用逗號在同一個 print() 同時輸出文字與結果。')
        return {'ok':True,'output':output.getvalue(),'checks':checks}
    except Exception as e:
        line=getattr(e,'lineno',None)
        if line is None:
            tb=e.__traceback__
            while tb:
                if tb.tb_frame.f_code.co_filename=='mission.py': line=tb.tb_lineno
                tb=tb.tb_next
        return {'ok':False,'output':output.getvalue()[:4000],'error':type(e).__name__,'message':str(e),'line':line}
