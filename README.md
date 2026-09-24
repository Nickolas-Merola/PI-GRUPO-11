# MaqTemp: Sistema de Monitoramento de Temperatura para Bombas Centrífugas

## Sobre o Projeto
O MaqTemp é um protótipo de sistema de monitoramento desenvolvido para medir e acompanhar, em tempo real, a temperatura de motores elétricos utilizados no acionamento de bombas centrífugas na indústria de tintas. O projeto atua de forma preventiva: coleta dados, processa-os em um microcontrolador e emite alertas visuais em um *dashboard* quando os limites de segurança são ultrapassados.

## O Problema e o Impacto
Na indústria de tintas, a sobrecarga, o desgaste mecânico ou o desalinhamento das bombas centrífugas podem provocar o superaquecimento dos motores elétricos. 
* **Impacto Financeiro:** Falhas inesperadas causam perdas que podem ultrapassar R$ 60.500,00 por ocorrência, incluindo a perda de matérias-primas (como o endurecimento irreversível de resinas epóxi), lucros cessantes e custos com reparações.
* **Risco de Segurança e Compliance:** Motores superaquecidos em ambientes com solventes inflamáveis funcionam como fontes de ignição, violando normas de segurança (NR-12 e NR-20) e expondo a fábrica a riscos graves de incêndio e multas.

## A Solução (Funcionalidades)
O sistema opera através de três faixas de monitoramento definidas para os testes de validação:
* 🟢 **Normal (Abaixo de 80 °C):** Operação segura.
* 🟡 **Aviso (Igual ou superior a 80 °C):** O sistema emite um primeiro alerta visual.
* 🔴 **Alerta Emergencial (Acima de 90 °C):** Indicação visual crítica na tela de monitoramento, exigindo atenção imediata.

O histórico de medições é armazenado e apresentado de forma organizada em um *dashboard* para facilitar a análise técnica.

### Por que o sistema não desliga o motor automaticamente?
Trata-se de uma decisão deliberada de arquitetura do projeto:
1. **Segurança:** Em um ambiente com inflamáveis, automatizar uma parada sem intervenção humana pode gerar cenários de maior risco em caso de falso positivo.
2. **Diagnóstico da Causa Raiz:** O sistema detecta o aumento térmico, mas a causa (desalinhamento, falta de lubrificação, etc.) requer a avaliação do operador para evitar paradas de produção desnecessárias.
3. **Custo-Benefício:** A automação exigiria atuadores complexos, fugindo ao escopo de um protótipo acessível. O operador tem sempre a palavra final.

## Tecnologias e Hardware Utilizados
* **Microcontrolador:** Arduino UNO R3
* **Sensor:** Sensor de temperatura LM35
* **Lógica de Alertas:** Sinais luminosos e integração de visualização de dados (*Dashboard*)

## Equipe de Desenvolvimento (Grupo 11)
Projeto acadêmico desenvolvido em São Paulo (2026) pelos seguintes membros:
* Nickolas Merola da Silva - RA 01262021
* Thayssa Santos Marques de Souza – RA 01262057
* Pedro Henrique de Mendonça Bittencourt - RA 01262102
* Willian Denis Santuches - RA 01262084
* Luis Otavio Jesus Alves - RA 01262078
---
*Este projeto pretende promover a sustentabilidade, prevenindo o desperdício industrial (ambiental), melhorando a segurança dos operadores (social) e reduzindo custos com manutenção corretiva (econômico).*