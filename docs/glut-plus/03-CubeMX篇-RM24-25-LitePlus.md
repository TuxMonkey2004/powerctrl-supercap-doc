# 03-CubeMX篇-RM24-25-LitePlus

来源：https://bbs.robomaster.com/article/343669
（桂林理工大学群星战队开源，CC BY 4.0；本地留存仅供写作引用）

---

## 碎碎念
本文只有Lite版本的CubeMX配置详解，Plus除了使用注入通道ADC外，几乎没有任何区别。
这篇文章是为了能够让刚开始学习STM32的小灯进行CubeMX配置的学习参考，对于超级电容的控制板的学习，只要把本文涉及的所有外设的相关配置有一定了解即可，其他外设的使用对超级电容项目并没有太大的帮助。全文均为语言描述，不免有表述不恰当或者解释不到位的地方，还请多斟酌。如果发现本文错误的地方也希望能够指出。
本文需搭配CubeMX进行食用。

## 简介

[图片]

本项目开发所使用的开发环境：
[分享]浅谈使用VSCode+EIDE+CubeMX开发STM32 HAL库-RoboMaster 社区

- STM32库：HAL（CubeMX）

- 开发语言：C语言

- 编译器：GCC

- 编辑器：VSCode+EIDE

- 调试：CubeMonitor/Cortex-Debug/LinkScope
本项目代码所使用的PID算法修改自Arduino的PID库，其为我解决了我2023年版本超级电容控制板代码中的些许问题，以及让我对PID的积分控制有了新的理解。我删剪了其中不必要的内容，仅保留对本项目所需要的内容。

## CubeMX配置
请注意，我在文中列举的关于《RM0440参考手册》的信息，他并不一定能帮助你去配置CubeMX，因为这个手册是寄存器手册，而不是代码说明书，他讲的所有东西都是最底层的寄存器，而CubeMX中的配置是进行了二次打包。对于他每个配置的作用，手册中虽然会有较为详细的介绍，但是其关键词信息有所不同，如果你刚接触STM32不久，不推荐你去阅读他的手册，当你通过CubeMX的配置教程对STM32有较多的了解之后，再试着去读一读手册会更加轻松。

### 引脚和配置-Pinout & Configuration
这里我是根据CubeMX页面的排列顺序列出的，但是实际上配置的时候，有一定的顺序要求，我会进行说明。

#### 系统核心-System Core

##### 通用输入输出接口-GPIO
GPIO的输出配置一般保持默认即可，输入配置则需根据按键的硬件连接决定是否开启上下拉，然后默认电平的话，就根据你自己板子的初始状态来决定咯。像是ADC啊，PWM啊之类的，我们则不需要管他，你在配置外设的时候他会有固定的配置。

- PA4：CAP_CTRL。电容开关（控制PMOS是否导通的）。

- PA8：LED_CAP。电容组指示灯。

- PB15：LED-CHASSIS。底盘指示灯。

- PB9：TEST_MDOE。测试模式控制，用于读取拨码开关信号的引脚，实际上没有相关代码。

- PB11：TIM1_Break_CTRL。TIM1刹车控制引脚，用来控制是否输出PWM。

- PB13：TEST_OUT。接到测试点上用于示波器观察电平翻转变化判断程序运行速度。

- PG10-NRST：TEST_IN。实际上这个引脚还是复位功能，可以不配置。

##### 独立看门狗-IWDG
独立看门狗由内部低速RC振荡器（LSI RC）提供时钟，在G4系列中固定为32Khz，它由一个12位向下计数器和一堆东西组成，当这个计数器从重装载值（reload value） 数到0（G4系列是数到0）的时候，他就会使单片机复位重新运行。如果在计数器数的过程中让他从重装载值 再次开始数，这个动作我们称其为喂狗（狗饿了就会叫，喂了，吃饱了就等着消化），只要在规定时间内喂狗就可以避免看门狗将单片机复位。看门狗一旦开启，就不能关闭，看门狗可以减少程序跑飞或者卡死造成的损失。

- IWDG counter clock prescaler ：独立看门狗计数器时钟预分频器。这个参数可以设置时钟的分频，决定看门狗的计数器一秒钟会数多少次。我这里配置成了32分频，时钟变成了32Khz / 32 = 1Khz，也就是计数器一秒钟数一千下。

- IWDG window value：独立看门狗窗口值。这个是设置一个窗口，让他在一个范围内不能喂狗，比如下面重装载值设定为100，如果这个设定为50，则说明计数器在50 ~ 100范围这个数值的时候无法喂狗。因为我不用这个功能（说实话我不知道这个功能有什么用），保持默认4095就是关闭这个功能。

- IWDG down-count reload value：独立看门狗向下计数重装载值。这个就是决定独立看门狗从多少开始向下数，数到0产生复位信号的值，你喂狗后他就会重新从这个值向下数。我这里配成了100，也就是数一百下（1Khz时钟需要10ms）没有喂狗他就会复位。

##### 嵌套向量中断控制器-NVIC
这里要配完ADC-DMA和FDCAN之后再配，放到最后再配。
注意把冻结DMA通道中断（Force DMA channel interrupts） 取消掉，这样就可以关掉ADC-DMA的默认中断，减少中断次数，减轻CPU性能开销。
这里我们只需要DMA1通道1全局中断（DMA1 channel1 global interrupts） 和FDCAN1中断0（FDCAN1 interrupts 0） 即可，但是需要注意，我们要把FDCAN中断的抢占优先级（Preemption Priority） 设置为1，这个优先级数字越小，其运行优先级越高，由于代码中的PI控制环路写在了DMA1中断中，且其必须实时运行，所以必须保证DMA1的中断优先级为最高 。DMA2通道1全局中断（DMA2 channel1 global interrupts） 是ADC2的DMA中断，默认开启的，需要我们手动关闭。

##### 复位和时钟控制-RCC
由于超级电容控制板需要使用FDCAN外设，其对时钟精度要求较高，内部的RC振荡器无法满足需求（会导致接收不到数据），所以必须开启外部高速时钟。
这里只需要把Mode中的高速外部时钟配置成无源晶体振荡器/陶瓷谐振器（Crystal/Ceramic Resonator） 即可（你想用有源晶振也行，不过没什么必要）。
其他没提到的设置保持默认即可，我也没改过。

##### 系统-SYS
每次新建一个STM32工程，都必须把这里的Debug选项打开，否则你的下载器就无法正常烧录程序！！！
Mode

- Deubg：调试。这是调试接口选项，一般的DapLink，STLink，Jlink都可以选择Serial Wire，其他的就看下载器支不支持了。

- VERFBUFF：参考缓冲。这是G4系列的内部参考电压，可作为ADC参考或者对外输出参考，而非从VDDA引脚取参考。
关于STM32内部参考的使用，请参考《AN5690应用笔记：如何在STM32 MCU和MPU上使用VREFBUF外设》。
Configuration
这里打开VERFBUFF之后才会出现，可以对VREFBUFF的电压进行选择，G4系列可以使用2.048V，2.5V和2.9V内部参考。

- Trimming Mode：校准模式，有厂家校准（Factory Trimming） 和用户校准（User Trimming） 可选，我这里选择厂家校准，或许会更可靠。

- Internal Voltage reference scale：内部参考电压挡位，本项目使用2.5V内部参考电压。
其他没提到的设置保持默认即可，我也没改过。

#### 模拟-Analog

##### 模数转换器1-ADC1
Mode
IN2 Single-ended：电池电流采样通道
IN12 Single-ended：电容温度采样通道
IN15 Single-ended：电容电流采样通道
Single-ended，也就是单端采样，根据单个通道的采样电压，范围从0~Vref，转换成0~2^N-1，N为ADC位数。
Configuration
ADCs_Common_Settings：ADC常规设置

- Mode：模式。一般情况下，选择独立运行模式即可，这个模式下，各个ADC之间是独立运行的；而多重模式下，各个ADC之间可以进行同步采样、交错采样等操作。

- Clock Prescaler：时钟预分频器。我喜欢用非同步时钟分频1，这样就可以在时钟树页面中直观地看到ADC时钟的频率了，如果使用分频，则需自己计算时钟频率。我也不知道同步时钟和非同步时钟有啥区别。

- Resolution：分辨率。G4系列的ADC最高分辨率为12位，可以过采样到16位。ADC的分辨率就是可以把引脚上的电压根据参考电压转换为0~2^N-1，其中N是ADC分辨率位数。

- Data Alignment：对齐方式。这个和存储方式有关系了，选右对齐就行。

- Gain Compensation：增益补偿。这个没用过，不知道。

- Scan Conversion Mode：扫描转换模式。额，我也不知道这是干啥的，如果你只开启1个规则组转换队列数量（Number Of Conversion） ，他就只能失能，而打开超过1个规则组转换队列数量（Number Of Conversion） 的时候，他又必须使能。

- End Of Conversion Selection：转换完成信号发送时刻选择。在规则组转换队列数量（Number Of Conversion） 大于1的时候，选择在每一个通道转换完成后发出一个信号，还是在整个队列结束后转换完成后发出一个信号。前者会产生多次中断与DMA请求来及时处理每一个数据，会占用更多的CPU资源，后者只会在队列完成后产生中断与DMA请求，本项目需要在所有通道的数据都转换完毕之后统一进行处理，所以选择后者。

- Low Power Auto Wait：低功耗自动等待，看名字应该是低功耗应用的，没玩过。

- Continuous Conversion Mode：连续转换模式。使能之后，一旦启动ADC，他就会一直运行。如果想通过触发进行采样，则必须失能。

- Discontinuous Conversion Mode：不连续转换模式。没用过，不知道。

- DMA Continuous Requests：连续请求。想要DMA一直进行ADC转换数据的搬运，需要把这个打开，否则DMA只会搬运开机之后的第一组ADC数据便会停止搬运。

- Enabled Overrun behaviour：溢出行为。如果不使用DMA来搬运ADC转换的数据，必须在每一个通道转换结束后使用CPU来读取ADC转换的数据，如果ADC速率较高则会占用很多的CPU时间，可能会导致无法及时读取，ADC就会产生溢出错误。如果使用DMA来搬运转换的数据，则完全不会占用CPU的时间，但是如果DMA被过多的外设占用，DMA来不及搬运数据，还是会产生溢出，一旦产生数据溢出，DMA就会停止搬运ADC的数据，直到手动清除溢出标注。这个选项就是设置溢出的时候，新数据是丢弃还是保存。
ADC_Regular_ConversionMode：ADC规则组转换模式。我只用过这个，同一个ADC，不同通道无法同时采样，规则组就是让开启的ADC通道按队列顺序进行采样。

- Enable Regular Conversions：使能规则组转换。

- Enable Regular Oversampling：规则组过采样。可以提高采样的分辨率，但是似乎会降低ADC采样率。没用过。

- Number Of Conversion：规则组转换队列数量。就是队列的长度。

- External Trigger Conversion Source：外部触发采样的源。本项目需要使用定时器来对ADC进行触发采样，对于规则组，触发一次他就会把规则组队列按顺序进行采样。

- External Trigger Conversion Edge：外部触发采样边缘，触发信号会长时间保持一个稳定的电平（高或低）。当他要进行触发时，他就会翻转电平，从高电平变为低电平会产生一个下降沿，从低电平变为高电平会产生一个上升沿。一般来说，只会选择某一个边缘进行触发以保证逻辑的准确，但是我这里选择两个边缘都触发，稍后解释。

- Rank1：队列1。队列中第一个。

- Channel：队列1中采样的通道。

- Sampling Time：采样时间。单位是时钟周期，ADC完成一次采样需要经过采样和转换两个步骤，采样时间越长，采样的值越准确，但是采样率就越低，转换时间根据ADC位数决定，12位则是12+0.5时钟周期，0.5是固定的。通过这两个值，就可以算出ADC的完整采样时间。

- Offset Number：偏置。用来对ADC进行硬件补偿的，没用过。

- Rank2：队列2。队列中第二个。

- Rank3：队列3。队列中第三个。
ADC_Injected_ConversionMode：ADC注入组转换模式。注入组可以插队规则组，注入组中的队列也是按照顺序进行采样的。没用过。
Analog Watchdog：模拟看门狗。可以设定一个阈值，检测ADC转换数据是否超出阈值，超出多久之后可以触发中断，然后进行保护相关的操作。我没用过，我是自己写的保护检测。因为这个看门狗检测的是ADC的原始数据（0-4095），比较抽象，所以我懒得用。
DMA Settings
这里点添加，然后DMA请求（DMA Request） ，方向（Direction） 保持默认（你也改不了）；通道（Channel） 最好ADC1和ADC2选择不同的DMA，以免数据太多造成DMA堵塞；Priority 如果没有其他使用DMA的外设，可以保持默认的低（Low），如果有其他使用DMA的外设，建议设置为非常高（Very High）以保证ADC数据的正常搬运，因为ADC的数据量需求最大。
DMA Request Setting
Mode：DMA转换请求模式。由于ADC的数据需要不断地进行DMA搬运，所以需要开启循环（Circular） 。如果使用的是普通（Normal） ，他将会在开机后的第一组转换队列结束后关闭DMA传输，无视所有DMA请求，直到手动重新开启DMA。
Increment Address：内存地址自增。ADC是一个外设，它产生的数据需要使用DMA搬运到内存，也就是对应方向（Direction） 选项中的外设到内存（Peripheral To memory） 。而由于我们使用了多个通道的数据，ADC一次只能进行一个通道的采样转换，每完成一次转换就需要DMA进行一次搬运。如果不打开内存地址自增功能，则他每次都会把数据搬运到同一个位置，覆盖上一个搬运到这里的数据。如果打开了内存地址自增功能，就可以实现把多个通道的数据搬运到一个数组（一个连续的地址）内，每个数组成员的数据对应不同通道的转换值。
Data Width：数据长度。半字就是16bit，由于ADC是12bit的，所以用16bit就可以了。同时，他也决定了内存地址自增（Increment Address） 中每次的地址增量。只要把接收的数组定义成uint16_t，他的每个成员的地址偏移量也就是16bit，从而实现数据不同成员的数据对应存储不同的通道的转换数据。

##### 模数转换器2-ADC2
各个选项的解释同ADC1，这里不再赘述。
IN3 Single-ended：电容电压采样通道
IN12 Single-ended：半桥温度采样通道
IN13 Single-ended：电池电压采样通道
注意事项
仔细观察发现，我在ADC1和ADC2中同时使用通道12作为温度采样通道，并且在队列中也是以第三位进行采样，一般情况下，请尽量避免这个操作。因为不同单片机之间不同ADC是会有ADC通道复用的情况发生，如果两个ADC复用了同一个通道，请务必避免这两个通道同时进行采样。而我这里这样使用是因为ADC1和ADC2的通道12均为单独的通道。
关于ADC之间通道的分配情况，请自行查阅《RM0440参考手册》有关ADC的内容。

##### 可调增益运算放大器1-OPAMP1
Mode
Mode：Follower。跟随模式。用来作为INA181双向电流采样偏置电压的阻抗变换。和普通的运放没啥区别，运放怎么使用自己去查。
Configuration

- Power Mode：Normal。电源模式，普通和快速，因为这里只是对偏置电压进行阻抗变换，是一个恒定不变的值，用啥都一样。

- User Trimming：Disable。用户校准，不使能，感觉没啥用。

#### 定时器-Timer

##### 定时器1-TIM1
Mode
Channel1：Output Compare CH1N。此通道用于触发ADC采样，可以配置成其他模式。

Channel2：PWM Generation CH2 CH2N。此通道是半桥PWM的输出通道，CH2对应上半桥，CH2N对应下半桥。
Activate Break Input：使能刹车输入。这是是外部输入引脚的使能。因为刹车不能软件触发（或许可以？我不知道）所以我选择使用IO来控制TIM1_BKIN实现手动控制PWM是否刹车。这和带使能引脚的栅极驱动器功能一样。
Configuration
Counter Settings：计数器设置

- Prescaler(PSC - 16 bits value) ：预分频。不需要设置，就让定时器以最快的时钟速度运行，可以获得最高的计时精度。

- Counter Mode：计数器模式。我看到有不少人疑惑使用什么计数模式，实际上，定时器的计数器模式并不会对产生的PWM效果产生什么影响。只是不同的计数器模式实现某些特殊的时序或者机制的时候会更加方便，并不代表其他计数器模式无法获得同样的效果。（具体不同计数器模式的实现过程我就不展开说了，这里我只针对我所配置的向上模式进行说明。）

- Dithering：抖动。G4系列新增的一个可以“提高”PWM分辨率的模式。

- Integer Counter Period ：整数计数器周期。（这是开了抖动模式之后的名字，非抖动模式下，他的名字为Counter Period）这个数值决定PWM产生的频率，在向上计数模式下，PWM频率计算公式为：Fpwm = Fapb2 / (CKD + 1) / (Prescaler + 1) / (Period + 1)。可以理解为PWM单个周期时间长度占多少个定时器计数长度。这个值越高，PWM占空比的分辨率就越高，所以需要将预分频设置为0（不分频）。

- Fractionnal_Period：分数周期。这个是抖动（Dithering） 特有的参数，你就把他理解为PWM分辨率提高的倍数就行。
整数计数器周期（Integer Counter Period）和分数周期（Fractionnal_Period），共同决定了【ARR】寄存器的值，也就是决定了PWM的频率。

- Intemal Clock Division (CKD)：内部时钟分频。这个也不用分频，但是为啥ST把他放到后面来呢？不理解。

- Repetition Counter：重复计时器，这个跟中断有关，但是由于我没使用定时器中断，所以这个值也不用管。

- Auto-reload preload：自动重装载预加载。这个是对应重复计数器（Repetition Counter） 的，这个会在改变数值的时候生效。如果使能自动重装载，则会在更新当前事件之后更新数值；若失能自动重装载，则在写入的同时直接更新数值。
Trigger Output (TRGO) Parameters：触发输出参数

- Master/Slave Mode (MSM bit)：主/从模式。没玩过，不知道，保持默认。

- Trigger Event Selection TRGO：触发事件选择，输出1。这个是拿来给ADC触发采样用的，不设置这个触发输出，直接通过TIM通道的更新事件也可以完成触发，只是我觉得设置这个会比较方便。

- Trigger Event Selection TRGO2：触发事件选择，输出2。这个没用到，保持默认即可。
Break And Dead Time management - BRK Configuration：刹车和死区时间管理-BRK1配置

- BRK State：刹车状态。就是使不使能刹车保护。

- BRK Polarity：刹车极性。就是刹车输入为高或者低的时候刹车生效。刹车输入需要由刹车源进行输入，本项目使用的是外部输入TIM1_BKIN。

- BRK Fitter (4 bits value)：刹车滤波。就是刹车信号为配置极性的时候，经过多少个计时器周期才会生效保护。

- BRK Sources Configuration：刹车源配置。

Digital Input：数字输入。也就是TIM1_BKIN作为输入源。必须先勾选激活刹车输入（Activate Break Input） 。

- Break_IO mode selection：刹车输入输出模式选择。

- Diaital Input Polarity：数字输入极性。就是外部输入TIM1_BKIN接口的电平，这个和刹车极性（BRK Polarity） 是同时生效的。这个选项决定外部输入为高或低的时候，给刹车一个高信号，刹车是否生效还需要判断刹车极性（BRK Polarity） 。
Break And Dead Time management - BRK2 Configuration：刹车和死区时间管理-BRK2配置，不使用BRK2
Break And Dead Time management - Output Configuration：刹车和死区时间管理-输出配置

- Automatic Output State：自动输出状态。刹车是一种保护机制，如果希望他在退出刹车的同时恢复PWM的输出，则需要将这个使能，若失能则需要手动写寄存器让他恢复。

- Off State Selection for Run Mode (OSSR）：运行模式的关闭状态选择。这个与本项目无关，手册关于此选项的解释也有一点很难理解，反正就是不使能就是了。

- Off State Selection for ldle Mode (OSSI）：空闲模式的关闭状态选择。如果使能，则PWM引脚在刹车状态时的输出电平由通道空闲状态（CH ldle State） 决定；如果失能，则PWM引脚在刹车状态时输出高阻态，需要由上下拉电阻决定其状态（我不知道内置的上下拉会不会生效）。

- Lock Configuration：锁配置。刹车的时候说明发生了某些错误，这个锁的等级就表示发生错误之后，STM32的某些寄存器无法被修改，或者无法重新输出PWM之类的，必须等到下电再上电才能恢复正常。

- DeadTime Preload：死区预加载。和前面的预加载一样。不过死区一旦固定，就不会再改了，所以这个选项使能失能都没什么影响。

- Dead Time：死区时间。顾名思义。

- Asymmetrical DeadTime：不对称死区时间。如果是对称，则死区时间由死区时间（Dead Time） 决定，如果是不对称死区时间，则死区时间（Dead Time） 为上升死区时间。

- Falling Dead Time：下降死区时间。顾名思义，开启不对称死区时间才会出现。
这两个死区时间，不需要纠结他给多大，第一次的话，稍微给大一点，然后根据板子的表现调就行了。
Clear Input：清除输入。没玩过不知道。
Output Compare Channel 1N：输出比较通道1互补通道。这是ADC采样触发源。

- Mode：模式。这里我是用匹配时翻转（toggle on match） ，也就是定时器的计数值【CNT】等于【CCR1】的时候，他的输出电平，就会反转。

- Pulse (12 bits value)：脉冲：这个决定输出何时翻转。不用管，会在运行的时候跟随PWM赋值。

- Fractionnal_Pulse /16：分数脉冲。这是开启抖动之后特有的数值。不用管，会在运行的时候跟随PWM赋值。
脉冲（Pulse）和分输脉冲（Fractionnal_Pulse /16），共同决定了【CCR1】寄存器的值，也就是决定了这个通道何时翻转。

- Output compare preload：输出比较预加载。和前面的预加载一样。

- CHN Polarity：互补通道极性。这个选项对于本通道所产生的效果没影响。

- CHN ldle State：互补通道空闲输出状态。OSSI 使能之后，刹车状态互补通道的输出由此选项决定。
PWM Generation Channel 2 and 2N：PWM常规通道2和2反相。这是半桥的输出通道。

- mode：模式。好多好多模式，我只知道PWM1和PWM2，PWM1模式下，当定时器计数值【CNT】小于【CCR2】的时候，【ocREF】就输出高电平，反之则输出低电平；若为PWM2模式，则与PWM1反相。

- Pulse (12 bits value)：脉冲，这个决定PWM输出的占空比。不用管，会在运行的时候让PI来计算赋值。

- Fractionnal_Pulse /16：分数脉冲。这是开启抖动之后特有的数值。不用管，会在运行的时候让PI来计算赋值。
脉冲（Pulse）和分输脉冲（Fractionnal_Pulse /16），共同决定了【CCR】寄存器的值，也就是决定了PWM的脉宽。

- Output compare preload：输出比较值预加载。和前文的预加载一样。

- Fast Mode：快速模式。不知道，没在手册看到。

- CH Polarity：主通道极性。决定主通道的电平和【ocREF】电平是同相还是反相，设置为高则是与ocREF同相；低则反相。

- CHN Polarity：互补通道极性。如果使用互补PWM模式，则此选项无效。

- CH ldle State：主通道空闲输出状态。OSSI 使能之后，刹车状态主通道的输出由此选项决定。

- CHN ldle State：互补通道空闲输出状态。OSSI 使能之后，刹车状态互补通道的输出由此选项决定。
PWM和ADC采样示意图

[图片]

#### 通信（接口？）-Connectivity

##### 具有灵活数据速率的控制器局域网1-FDCAN1
我对CAN的协议层没怎么研究，这些参数都有啥用我就不知道了，照着我这个配置来配就行。最重要的是要把Nominal Baud Rate配置成1Mbit/s（我这少了1我也不知道怎么回事，但是能用）。
Mode
Activated
Configuration
Basic Parameters

- Clock Divider：时钟分频。不用分频。

- Frame Format：帧格式，我们这里用经典CAN，因为DJI也用的经典CAN，超电才能与C板通信。

- Mode：模式。就普通模式就行，静默模式只收不发，回环模式是测试用的。

- Auto Retransmission：自动重传。不要开，可能会导致CAN总线爆炸，虽然不开可能会丢包。

- Transmit Pause：传输暂停。不知道什么东西。

- Protocol Exception：协议异常。不知道是什么东西。

- Nominal Sync Jump Width：标称同步跳跃宽度。不知道是什么东西，这个我抄了C板例程的ReSynchronization Jump Width 选项，这两个是同一个东西。
以下四个参数是FDCAN才需要配置的参数，保持默认即可。

- Data Prescaler

- Data Sync Jump Width

- Data Time Seg1

- Data Time Seg2

- Std Filter Nbr：标准过滤器数量。填几就开启多少个过滤器序列，过滤器是硬件的，非常可靠，一定要打开！

- Ext Filter Nbr：拓展过滤器数量。因为DJI的CAN用的是标准ID，所以不需要过滤拓展ID。

- Tx Fifo Queue Mode：发送FIFO/队列模式。因为C板用的FIFO，所以这里也跟着用FIFO，如果你会用队列也可以试试。
Bit Timings Parameters
下面这三个参数决定CAN的波特率，怎么算我也不懂，我随便配出来的，不知道有什么讲究。Seg1和Seg2，我查资料说是要有一个合适的比例通信会更好，我看C板差不多是3：1，所以我这里也配成了3：1。剩下灰色的参数是自己生成的，需要注意波特率是1Mbit/s才能接入C板的CAN总线进行通信。

- Nominal Prescaler

- Nominal Time Seg1

- Nominal Time Seg2
一定要先去时钟树那里配完时钟再调这个波特率，不然后面时钟改了就爆炸了。
NVIC Setting
FDCAN1 interrupt 0。打开FDCAN中断0。

### 时钟配置-Clock Configuration
这里就是STM32的时钟树了。看不懂没关系，你把时钟输入切换成最左侧的HSE，并且在框内填入你所使用的晶振频率（本项目是25Mhz），然后中间的HCLK填上最高频率，CubeMX会自动帮你计算其他的参数（如果算不出来，那就抄！）

需要注意的是，在ADC的时钟选择中，我选择的是非同步时钟分频1。而我所说的方便设置ADC时钟也就是在这里。只需要把ADC的时钟切换成PLLP时钟，就可以通过PLLP的分频器来决定ADC的时钟了（我不知道PLLP时钟还跟别的哪些外设有关，至少这个项目没受到影响）。而我这里设置成56.7Mhz是为了和手册上的60Mhz测试时钟对应上，以便参考阻抗提高采样精度。（但是似乎影响不是很大，我也没办法进行测试？）

### 项目管理-Project Manager

#### 项目-Project
Project Name：项目名称。请务必使用英文，特殊符号我只知道支持下划线_。

Toolchain / IDE：工具链。因为我是用VSCode+GCC进行编译，所以选择Makefile。若是使用Keil则可直接改成MDK-ARM。生成的代码是一样的。
其他保持默认即可。

#### 代码生成器-Code Generator
Copy only the necessary library files：复制必要的库文件。节省工程体积。
Generate peripheral initialization as a pair of ‘.c/.h’ files per peripheral：为每个外围设备生成一对“.c/.h”文件作为外围设备初始化。这样就不会一大堆东西挤在main.c里面了。

- Keep User Code when re-generating：CubeMX重新生成的时候保留用户代码。（前提是你把代码写在USER CODE BEGIN 和USER CODE END 之间）。一定要选择！
Delete previously generated files when not re-generated：删除以前生成但现在没有生成的文件。也是起到精简工程体积的作用，比如你以前用了某个外设，现在不用了，他就会把之前那个外设的初始化文件和库删掉。
Set all free pins as analog (to optimize the power consumption) ：设置所有“免费”引脚为模拟（高阻态）（优化功耗）。优化功耗的同时也可以减少引脚短路造成损失。
其他保持默认即可。

## 工程文件
由于Lite与Plus的硬件不同，所以CubeMX的代码初始化也不相同。
现已不推荐使用Lite版本的硬件

### Lite
RM-CODE-SuperCapControlBoard_Lite-main.zip

### Plus
RM-CODE-SuperCapControlBoard_Plus-main.zip
CubeMX工程仅包含了初始化代码，完整的运行代码依赖`SuperCapCtrl.h` 
[开源]【RM24-25超级电容控制板Lite & Plus「软件篇」】桂林理工大学-群星战队-RoboMaster 社区

## 参考资料
无法追寻的不计其数的教程。
PID | Project Blog
GitHub - RoboMaster/Development-Board-C-Examples

《LAT1076：STM32G4高级定时器刹车功能》
《LAT1444：ADC采样中的阻抗匹配计算方法》
《RM0440：STM32G4系列基于Arm®的32位MCU》
《AN2834：如何在STM32微控制器中获得最佳ADC精度》
《AN3116：STM32™的ADC模式及其应用》
《AN5690：如何在STM32 MCU和MPU上使用VREFBUF外设》

## Github
RM24-25超级电容控制板Lite & Plus「CubeMX篇」 – github.io