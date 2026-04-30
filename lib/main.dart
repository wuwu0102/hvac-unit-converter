import 'package:flutter/material.dart';
import 'core/converters.dart';

void main() => runApp(const HvacApp());

class HvacApp extends StatelessWidget {
  const HvacApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HVAC Unit Converter',
      theme: ThemeData(useMaterial3: true),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) {
    final items = [
      ('空調能力轉換', () => const GenericPage(title: '空調能力轉換', units: ['RT','kW','kcal/h','BTU/h'], mapType: 0)),
      ('溫度轉換', () => const TempPage()),
      ('風量轉換', () => const GenericPage(title: '風量轉換', units: ['CFM','CMH','m³/s','L/s','LPM','CMM'], mapType: 1)),
      ('壓力轉換', () => const GenericPage(title: '壓力轉換', units: ['Pa','kPa','mmAq','bar','psi','N/m²'], mapType: 2)),
      ('電力轉換', () => const GenericPage(title: '電力轉換', units: ['W','kW','MW','HP'], mapType: 3)),
      ('三相電力估算', () => const PowerPage(three: true)),
      ('單相電力估算', () => const PowerPage(three: false)),
      ('電流估算', () => const CurrentPage()),
    ];
    return Scaffold(appBar: AppBar(title: const Text('HVAC 單位轉換工具')), body: ListView(padding: const EdgeInsets.all(16), children: items.map((e)=>Padding(padding: const EdgeInsets.only(bottom:12), child: FilledButton(onPressed: ()=>Navigator.push(context, MaterialPageRoute(builder: (_)=>e.$2())), child: Padding(padding: const EdgeInsets.all(16), child: Text(e.$1))))).toList()));
  }
}
class GenericPage extends StatefulWidget { const GenericPage({super.key, required this.title, required this.units, required this.mapType}); final String title; final List<String> units; final int mapType; @override State<GenericPage> createState()=>_GenericPageState(); }
class _GenericPageState extends State<GenericPage>{ String unit=''; final c=TextEditingController(); Map<String,double> r={}; @override void initState(){super.initState(); unit=widget.units.first; c.addListener(calc);} void calc(){ final v=double.tryParse(c.text); if(v==null){setState(()=>r={}); return;} final maps=[UnitConverters.coolingToRt,UnitConverters.airflowToCmh,UnitConverters.pressureToPa,UnitConverters.powerToKw]; setState(()=>r=UnitConverters.convertGeneric(v,unit,maps[widget.mapType])); }
@override Widget build(BuildContext context)=>Scaffold(appBar: AppBar(title: Text(widget.title)),body: Padding(padding: const EdgeInsets.all(16), child: Column(children:[TextField(controller:c,keyboardType: const TextInputType.numberWithOptions(decimal:true),decoration: const InputDecoration(labelText:'輸入數值',border: OutlineInputBorder())),const SizedBox(height:12),DropdownButtonFormField(initialValue:unit,items:widget.units.map((u)=>DropdownMenuItem(value:u,child:Text(u))).toList(),onChanged:(v){setState(()=>unit=v!);calc();},decoration: const InputDecoration(labelText:'單位',border: OutlineInputBorder())),const SizedBox(height:12),Expanded(child:ListView(children:widget.units.where((u)=>u!=unit).map((u)=>ListTile(title:Text(u),trailing:Text(r[u]?.toStringAsFixed(4)??'-'))).toList()))])));
}
class TempPage extends StatefulWidget{ const TempPage({super.key}); @override State<TempPage> createState()=>_TempPageState(); }
class _TempPageState extends State<TempPage>{ final c=TextEditingController(); String unit='°C'; Map<String,double> r={}; @override void initState(){super.initState(); c.addListener(calc);} void calc(){final v=double.tryParse(c.text); setState(()=>r=v==null?{}:UnitConverters.convertTemp(v,unit));}
@override Widget build(BuildContext context)=>Scaffold(appBar: AppBar(title: const Text('溫度轉換')),body:Padding(padding: const EdgeInsets.all(16), child: Column(children:[TextField(controller:c,decoration: const InputDecoration(labelText:'輸入溫度',border: OutlineInputBorder()),keyboardType: const TextInputType.numberWithOptions(decimal:true)),const SizedBox(height:12),DropdownButtonFormField(initialValue:unit,items:['°C','°F'].map((u)=>DropdownMenuItem(value:u,child:Text(u))).toList(),onChanged:(v){setState(()=>unit=v!);calc();},decoration: const InputDecoration(border: OutlineInputBorder(),labelText:'單位')),const SizedBox(height:12),ListTile(title: const Text('°C'),trailing: Text(r['°C']?.toStringAsFixed(4)??'-')),ListTile(title: const Text('°F'),trailing: Text(r['°F']?.toStringAsFixed(4)??'-'))])));
}
class PowerPage extends StatefulWidget{ const PowerPage({super.key,required this.three}); final bool three; @override State<PowerPage> createState()=>_PowerPageState(); }
class _PowerPageState extends State<PowerPage>{ final v=TextEditingController(),a=TextEditingController(),pf=TextEditingController(text:'0.85'); double? kw,kva; @override void initState(){super.initState(); for(final c in [v,a,pf]){c.addListener(calc);} } void calc(){final vv=double.tryParse(v.text),aa=double.tryParse(a.text),pp=double.tryParse(pf.text); if(vv==null||aa==null||pp==null){setState((){kw=null;kva=null;});return;} final rs=widget.three?UnitConverters.threePhase(vv,aa,pp):UnitConverters.singlePhase(vv,aa,pp); setState((){kw=rs.kw;kva=rs.kva;}); }
@override Widget build(BuildContext context)=>Scaffold(appBar: AppBar(title: Text(widget.three?'三相電力估算':'單相電力估算')),body:Padding(padding: const EdgeInsets.all(16), child: Column(children:[for(final e in [('電壓 V',v),('電流 A',a),('功率因數 PF',pf)]) Padding(padding: const EdgeInsets.only(bottom:12),child:TextField(controller:e.$2,decoration:InputDecoration(labelText:e.$1,border: const OutlineInputBorder()),keyboardType: const TextInputType.numberWithOptions(decimal:true))),ListTile(title: const Text('kW'),trailing: Text(kw?.toStringAsFixed(4)??'-')),ListTile(title: const Text('kVA'),trailing: Text(kva?.toStringAsFixed(4)??'-'))])));
}
class CurrentPage extends StatefulWidget{ const CurrentPage({super.key}); @override State<CurrentPage> createState()=>_CurrentPageState(); }
class _CurrentPageState extends State<CurrentPage>{ final kw=TextEditingController(),v=TextEditingController(),pf=TextEditingController(text:'0.85'); bool three=true; double? a; @override void initState(){super.initState(); for(final c in [kw,v,pf]){c.addListener(calc);} } void calc(){final k=double.tryParse(kw.text),vv=double.tryParse(v.text),pp=double.tryParse(pf.text); if(k==null||vv==null||pp==null){setState(()=>a=null);return;} setState(()=>a=UnitConverters.estimateCurrent(kw:k,v:vv,pf:pp,threePhase:three));}
@override Widget build(BuildContext context)=>Scaffold(appBar: AppBar(title: const Text('電流估算')),body:Padding(padding: const EdgeInsets.all(16), child: Column(children:[for(final e in [('kW',kw),('電壓 V',v),('功率因數 PF',pf)]) Padding(padding: const EdgeInsets.only(bottom:12),child:TextField(controller:e.$2,decoration:InputDecoration(labelText:e.$1,border: const OutlineInputBorder()),keyboardType: const TextInputType.numberWithOptions(decimal:true))),SwitchListTile(value:three,onChanged:(x){setState(()=>three=x);calc();},title: Text(three?'三相':'單相')),ListTile(title: const Text('電流 A'),trailing: Text(a?.toStringAsFixed(4)??'-'))])));
}
